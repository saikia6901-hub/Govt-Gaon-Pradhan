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


    await loadDistricts();
    await loadVillages();

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

  if (!targetSelect) {

    console.error(
      "Revenue Circle select element not found."
    );

    return;
  }


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


  try {

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
        )
      );


    const snapshot =
      await getDocs(
        circleQuery
      );


    const circles = [];


    snapshot.forEach(
      (circleDoc) => {

        const data =
          circleDoc.data();


        // Only active Revenue Circles
        if (
          data.status !== "active"
        ) {

          return;
        }


        circles.push({

          id:
            circleDoc.id,

          name:
            data.name || ""

        });

      }
    );


    // Sort alphabetically
    circles.sort(
      (a, b) =>
        a.name.localeCompare(
          b.name
        )
    );


    circles.forEach(
      (circle) => {

        const option =
          document.createElement(
            "option"
          );


        option.value =
          circle.id;


        option.textContent =
          circle.name;


        targetSelect.appendChild(
          option
        );

      }
    );


    // No circles found
    if (
      circles.length === 0
    ) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        "";


      option.textContent =
        includeAllOption
          ? "No Revenue Circles Found"
          : "No Revenue Circles Found";


      targetSelect.appendChild(
        option
      );

    }


  } catch (error) {

    console.error(
      "Revenue Circle loading error:",
      error
    );


    targetSelect.innerHTML =
      `<option value="">
        Unable to load Revenue Circles
       </option>`;


    alert(
      "Unable to load Revenue Circles.\n\n" +
      (error.code || "Unknown error") +
      "\n\n" +
      (error.message || error)
    );

  }

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

  if (!targetSelect) {
    console.error("Mouza select element not found.");
    return;
  }

  // Reset dropdown
  targetSelect.innerHTML =
    includeAllOption
      ? `<option value="">All Mouzas</option>`
      : `<option value="">Select Mouza</option>`;

  // Nothing selected
  if (!districtId || !circleId) {
    return;
  }

  try {

    // Get all Mouzas first
    // Then filter by District + Revenue Circle
    // This avoids Firestore composite-index problems.

    const mouzaSnapshot =
      await getDocs(
        collection(db, "mouzas")
      );

    let found = 0;

    const mouzas = [];

    mouzaSnapshot.forEach((mouzaDoc) => {

      const data =
        mouzaDoc.data();

      // District must match
      if (
        data.districtId !== districtId
      ) {
        return;
      }

      // Revenue Circle must match
      if (
        data.revenueCircleId !== circleId
      ) {
        return;
      }

      // Only active Mouzas
      if (
        data.status !== "active"
      ) {
        return;
      }

      mouzas.push({
        id: mouzaDoc.id,
        name: data.name || ""
      });

    });


    // Sort by Mouza name
    mouzas.sort(
      (a, b) =>
        a.name.localeCompare(
          b.name
        )
    );


    // Add options
    mouzas.forEach(
      (mouza) => {

        const option =
          document.createElement(
            "option"
          );

        option.value =
          mouza.id;

        option.textContent =
          mouza.name;

        targetSelect.appendChild(
          option
        );

        found++;

      }
    );


    if (found === 0) {

      targetSelect.innerHTML =
        includeAllOption
          ? `<option value="">
              No Mouzas found
             </option>`
          : `<option value="">
              No Mouzas found
             </option>`;

      console.log(
        "No active Mouzas found for:",
        districtId,
        circleId
      );

      return;
    }


    console.log(
      `${found} Mouza(s) loaded successfully.`
    );


  } catch (error) {

    console.error(
      "Load Mouzas error:",
      error
    );


    targetSelect.innerHTML =
      includeAllOption
        ? `<option value="">
            Unable to load Mouzas
           </option>`
        : `<option value="">
            Unable to load Mouzas
           </option>`;


    alert(
      "Unable to load Mouzas.\n\n" +
      (error.code || "Unknown error") +
      "\n\n" +
      (error.message || error)
    );

  }

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
    );

}
