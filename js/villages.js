import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ========================================
// ELEMENTS
// ========================================

const villageForm =
  document.getElementById("villageForm");

const districtSelect =
  document.getElementById("districtSelect");

const circleSelect =
  document.getElementById("circleSelect");

const mouzaSelect =
  document.getElementById("mouzaSelect");

const villageList =
  document.getElementById("villageList");

const filterDistrict =
  document.getElementById("filterDistrict");

const filterCircle =
  document.getElementById("filterCircle");

const filterMouza =
  document.getElementById("filterMouza");

const searchVillage =
  document.getElementById("searchVillage");

const filterStatus =
  document.getElementById("filterStatus");

const editVillageModal =
  document.getElementById("editVillageModal");

const saveVillageEditBtn =
  document.getElementById("saveVillageEditBtn");

const cancelVillageEditBtn =
  document.getElementById("cancelVillageEditBtn");


// ========================================
// SUPER ADMIN CHECK
// ========================================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href =
      "login.html";

    return;
  }


  try {

    const userRef =
      doc(db, "users", user.uid);

    const userSnap =
      await getDoc(userRef);


    if (!userSnap.exists()) {

      alert(
        "User profile not found."
      );

      window.location.href =
        "login.html";

      return;
    }


    const userData =
      userSnap.data();


    if (
      userData.role !==
      "super_admin"
    ) {

      alert(
        "Access denied. Super Admin only."
      );

      window.location.href =
        "dashboard.html";

      return;
    }


    document.getElementById(
      "adminEmail"
    ).textContent =
      "Logged in as: " + user.email;


    await Promise.all([
  loadDistricts(),
  loadVillages()
]);


  } catch (error) {

    console.error(
      "Authentication error:",
      error
    );

    alert(
      "Unable to verify administrator."
    );

  }

});


// ========================================
// LOAD DISTRICTS
// ========================================

async function loadDistricts() {

  districtSelect.innerHTML =
    `<option value="">
      Select District
     </option>`;

  filterDistrict.innerHTML =
    `<option value="">
      All Districts
     </option>`;


  const districtQuery =
    query(
      collection(
        db,
        "districts"
      ),
      orderBy("name")
    );


  const snapshot =
    await getDocs(
      districtQuery
    );


  snapshot.forEach(
    (districtDoc) => {

      const data =
        districtDoc.data();


      const option =
        document.createElement(
          "option"
        );

      option.value =
        districtDoc.id;

      option.textContent =
        data.name;

      districtSelect.appendChild(
        option
      );


      const filterOption =
        document.createElement(
          "option"
        );

      filterOption.value =
        districtDoc.id;

      filterOption.textContent =
        data.name;

      filterDistrict.appendChild(
        filterOption
      );

    }
  );

}


// ========================================
// LOAD REVENUE CIRCLES
// ========================================

async function loadRevenueCircles(
  districtId,
  targetSelect,
  includeAllOption = false
) {

  targetSelect.innerHTML =
    includeAllOption
      ? `<option value="">
          All Revenue Circles
         </option>`
      : `<option value="">
          Select Revenue Circle
         </option>`;


  if (!districtId) {

    return;
  }


  const circleQuery =
    query(
      collection(
        db,
        "revenueCircles"
      ),
      where(
        "districtId",
        "==",
        districtId
      ),
      orderBy("name")
    );


  const snapshot =
    await getDocs(
      circleQuery
    );


  snapshot.forEach(
    (circleDoc) => {

      const data =
        circleDoc.data();


      if (
        data.status !== "active"
      ) {

        return;
      }


      const option =
        document.createElement(
          "option"
        );

      option.value =
        circleDoc.id;

      option.textContent =
        data.name;

      targetSelect.appendChild(
        option
      );

    }
  );

}


// ========================================
// LOAD MOUZAS
// ========================================

async function loadMouzas(
  districtId,
  circleId,
  targetSelect,
  includeAllOption = false
) {

  targetSelect.innerHTML =
    includeAllOption
      ? `<option value="">
          All Mouzas
         </option>`
      : `<option value="">
          Select Mouza
         </option>`;


  if (
    !districtId ||
    !circleId
  ) {

    return;
  }


  const mouzaQuery =
    query(
      collection(
        db,
        "mouzas"
      ),
      where(
        "districtId",
        "==",
        districtId
      ),
      where(
        "revenueCircleId",
        "==",
        circleId
      ),
      orderBy("name")
    );


  const snapshot =
    await getDocs(
      mouzaQuery
    );


  snapshot.forEach(
    (mouzaDoc) => {

      const data =
        mouzaDoc.data();


      if (
        data.status !== "active"
      ) {

        return;
      }


      const option =
        document.createElement(
          "option"
        );

      option.value =
        mouzaDoc.id;

      option.textContent =
        data.name;

      targetSelect.appendChild(
        option
      );

    }
  );

}


// ========================================
// DISTRICT → CIRCLE
// ========================================

districtSelect.addEventListener(
  "change",
  async () => {

    await loadRevenueCircles(
      districtSelect.value,
      circleSelect,
      false
    );


    mouzaSelect.innerHTML =
      `<option value="">
        Select Mouza
       </option>`;

  }
);


// ========================================
// CIRCLE → MOUZA
// ========================================

circleSelect.addEventListener(
  "change",
  async () => {

    await loadMouzas(
      districtSelect.value,
      circleSelect.value,
      mouzaSelect,
      false
    );

  }
);


// ========================================
// ADD VILLAGE
// ========================================

villageForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const districtId =
      districtSelect.value;

    const circleId =
      circleSelect.value;

    const mouzaId =
      mouzaSelect.value;

    const villageName =
      document
        .getElementById(
          "villageName"
        )
        .value
        .trim();

    const status =
      document
        .getElementById(
          "villageStatus"
        )
        .value;


    if (
      !districtId ||
      !circleId ||
      !mouzaId
    ) {

      alert(
        "Please select District, Revenue Circle and Mouza."
      );

      return;
    }


    if (!villageName) {

      alert(
        "Please enter Village Name."
      );

      return;
    }


    try {

      const districtRef =
        doc(
          db,
          "districts",
          districtId
        );

      const circleRef =
        doc(
          db,
          "revenueCircles",
          circleId
        );

      const mouzaRef =
        doc(
          db,
          "mouzas",
          mouzaId
        );


      const [
        districtSnap,
        circleSnap,
        mouzaSnap
      ] =
        await Promise.all([
          getDoc(districtRef),
          getDoc(circleRef),
          getDoc(mouzaRef)
        ]);


      if (
        !districtSnap.exists() ||
        !circleSnap.exists() ||
        !mouzaSnap.exists()
      ) {

        alert(
          "Selected location data could not be found."
        );

        return;
      }


      const districtData =
        districtSnap.data();

      const circleData =
        circleSnap.data();

      const mouzaData =
        mouzaSnap.data();


      // ====================================
      // SECURITY RELATIONSHIP CHECK
      // ====================================

      if (
        circleData.districtId !==
        districtId
      ) {

        alert(
          "Selected Revenue Circle does not belong to this District."
        );

        return;
      }


      if (
        mouzaData.districtId !==
          districtId ||
        mouzaData.revenueCircleId !==
          circleId
      ) {

        alert(
          "Selected Mouza does not belong to this Revenue Circle."
        );

        return;
      }


      // ====================================
      // CREATE STABLE VILLAGE ID
      // ====================================

      const villageId =
        `${districtId}__${circleId}__${mouzaId}__${createId(villageName)}`;


      const villageRef =
        doc(
          db,
          "villages",
          villageId
        );


      const existing =
        await getDoc(
          villageRef
        );


      if (
        existing.exists()
      ) {

        alert(
          "This Village already exists under the selected Mouza."
        );

        return;
      }


      // ====================================
      // SAVE VILLAGE
      // ====================================

      await setDoc(
        villageRef,
        {

          villageId:
            villageId,

          name:
            villageName,

          districtId:
            districtId,

          districtName:
            districtData.name,

          revenueCircleId:
            circleId,

          revenueCircleName:
            circleData.name,

          mouzaId:
            mouzaId,

          mouzaName:
            mouzaData.name,

          state:
            "Assam",

          status:
            status,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),

          createdBy:
            auth.currentUser.uid,

          updatedBy:
            auth.currentUser.uid

        }
      );


      alert(
        "Village added successfully."
      );


      villageForm.reset();


      circleSelect.innerHTML =
        `<option value="">
          Select Revenue Circle
         </option>`;


      mouzaSelect.innerHTML =
        `<option value="">
          Select Mouza
         </option>`;


      await loadVillages();


    } catch (error) {

      console.error(
        "Add Village error:",
        error
      );


      alert(
        "Unable to add Village."
      );

    }

  }
);


// ========================================
// LOAD VILLAGES
// ========================================

async function loadVillages() {

  villageList.innerHTML =
    "<p>Loading Villages...</p>";


  try {

    const villageQuery =
      query(
        collection(
          db,
          "villages"
        ),
        orderBy("name")
      );


    const snapshot =
      await getDocs(
        villageQuery
      );


    if (
      snapshot.empty
    ) {

      villageList.innerHTML =
        "<p>No Villages added yet.</p>";

      return;
    }


    const selectedDistrict =
      filterDistrict.value;

    const selectedCircle =
      filterCircle.value;

    const selectedMouza =
      filterMouza.value;

    const selectedStatus =
      filterStatus.value;

    const searchText =
      searchVillage.value
        .trim()
        .toLowerCase();


    let html = "";

    let visibleCount = 0;


    snapshot.forEach(
      (villageDoc) => {

        const data =
          villageDoc.data();


        const status =
          data.status ||
          "inactive";


        if (
          selectedDistrict &&
          data.districtId !==
            selectedDistrict
        ) {

          return;
        }


        if (
          selectedCircle &&
          data.revenueCircleId !==
            selectedCircle
        ) {

          return;
        }


        if (
          selectedMouza &&
          data.mouzaId !==
            selectedMouza
        ) {

          return;
        }


        if (
          selectedStatus &&
          status !==
            selectedStatus
        ) {

          return;
        }


        const name =
          String(
            data.name || ""
          ).toLowerCase();


        if (
          searchText &&
          !name.includes(
            searchText
          )
        ) {

          return;
        }


        visibleCount++;


        const action =
          status === "active"
            ? "Deactivate"
            : "Activate";


        html += `

          <div
            class="card"
            style="
              margin-bottom:15px;
            "
          >

            <h3>
              ${escapeHtml(
                data.name
              )}
            </h3>

            <p>
              District:
              <strong>
                ${escapeHtml(
                  data.districtName || ""
                )}
              </strong>
            </p>

            <p>
              Revenue Circle:
              <strong>
                ${escapeHtml(
                  data.revenueCircleName || ""
                )}
              </strong>
            </p>

            <p>
              Mouza:
              <strong>
                ${escapeHtml(
                  data.mouzaName || ""
                )}
              </strong>
            </p>

            <p>
              Status:
              <strong>
                ${
                  status === "active"
                    ? "Active"
                    : "Inactive"
                }
              </strong>
            </p>

            <button
              class="btn"
              onclick="
                editVillage(
                  '${villageDoc.id}'
                )
              "
            >
              Edit
            </button>

            <button
              class="btn"
              onclick="
                toggleVillageStatus(
                  '${villageDoc.id}',
                  '${status}'
                )
              "
            >
              ${action}
            </button>

          </div>

        `;

      }
    );


    if (
      visibleCount === 0
    ) {

      villageList.innerHTML =
        "<p>No matching Village found.</p>";

      return;
    }


    villageList.innerHTML =
      html;


  } catch (error) {

    console.error(
      "Load Villages error:",
      error
    );


    villageList.innerHTML =
      "<p>Unable to load Villages.</p>";

  }

}


// ========================================
// DISTRICT FILTER → CIRCLE
// ========================================

filterDistrict.addEventListener(
  "change",
  async () => {

    await loadRevenueCircles(
      filterDistrict.value,
      filterCircle,
      true
    );


    filterMouza.innerHTML =
      `<option value="">
        All Mouzas
       </option>`;


    await loadVillages();

  }
);


// ========================================
// CIRCLE FILTER → MOUZA
// ========================================

filterCircle.addEventListener(
  "change",
  async () => {

    await loadMouzas(
      filterDistrict.value,
      filterCircle.value,
      filterMouza,
      true
    );


    await loadVillages();

  }
);


// ========================================
// OTHER FILTERS
// ========================================

filterMouza.addEventListener(
  "change",
  loadVillages
);

filterStatus.addEventListener(
  "change",
  loadVillages
);

searchVillage.addEventListener(
  "input",
  loadVillages
);


// ========================================
// EDIT VILLAGE
// ========================================

window.editVillage =
  async function (villageId) {

    try {

      const villageRef =
        doc(
          db,
          "villages",
          villageId
        );


      const villageSnap =
        await getDoc(
          villageRef
        );


      if (
        !villageSnap.exists()
      ) {

        alert(
          "Village not found."
        );

        return;
      }


      const data =
        villageSnap.data();


      document.getElementById(
        "editVillageId"
      ).value =
        villageId;


      document.getElementById(
        "editVillageName"
      ).value =
        data.name || "";


      document.getElementById(
        "editVillageStatus"
      ).value =
        data.status || "active";


      editVillageModal.style.display =
        "block";


    } catch (error) {

      console.error(
        "Edit Village error:",
        error
      );


      alert(
        "Unable to load Village."
      );

    }

  };


// ========================================
// SAVE VILLAGE EDIT
// ========================================

saveVillageEditBtn.addEventListener(
  "click",
  async () => {

    const villageId =
      document.getElementById(
        "editVillageId"
      ).value;


    const name =
      document.getElementById(
        "editVillageName"
      ).value
        .trim();


    const status =
      document.getElementById(
        "editVillageStatus"
      ).value;


    if (!name) {

      alert(
        "Village name is required."
      );

      return;
    }


    try {

      const villageRef =
        doc(
          db,
          "villages",
          villageId
        );


      await updateDoc(
        villageRef,
        {

          name:
            name,

          status:
            status,

          updatedAt:
            serverTimestamp(),

          updatedBy:
            auth.currentUser.uid

        }
      );


      alert(
        "Village updated successfully."
      );


      editVillageModal.style.display =
        "none";


      await loadVillages();


    } catch (error) {

      console.error(
        "Update Village error:",
        error
      );


      alert(
        "Unable to update Village."
      );

    }

  }
);


// ========================================
// CANCEL EDIT
// ========================================

cancelVillageEditBtn.addEventListener(
  "click",
  () => {

    editVillageModal.style.display =
      "none";

  }
);


// ========================================
// TOGGLE STATUS
// ========================================

window.toggleVillageStatus =
  async function (
    villageId,
    currentStatus
  ) {

    const newStatus =
      currentStatus === "active"
        ? "inactive"
        : "active";


    try {

      const villageRef =
        doc(
          db,
          "villages",
          villageId
        );


      await updateDoc(
        villageRef,
        {

          status:
            newStatus,

          updatedAt:
            serverTimestamp(),

          updatedBy:
            auth.currentUser.uid

        }
      );


      await loadVillages();


    } catch (error) {

      console.error(
        "Toggle Village status error:",
        error
      );


      alert(
        "Unable to update Village status."
      );

    }

  };


// ========================================
// CREATE SAFE ID
// ========================================

function createId(name) {

  return name
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      "");

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHtml(value) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
