import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
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


const mouzaForm =
  document.getElementById("mouzaForm");

const districtSelect =
  document.getElementById("districtSelect");

const circleSelect =
  document.getElementById("circleSelect");

const mouzaList =
  document.getElementById("mouzaList");

const filterDistrict =
  document.getElementById("filterDistrict");

const filterCircle =
  document.getElementById("filterCircle");

const searchMouza =
  document.getElementById("searchMouza");

const filterStatus =
  document.getElementById("filterStatus");

const editMouzaModal =
  document.getElementById("editMouzaModal");

const saveMouzaEditBtn =
  document.getElementById("saveMouzaEditBtn");

const cancelMouzaEditBtn =
  document.getElementById("cancelMouzaEditBtn");


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
      userData.role !== "super_admin"
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

    await loadMouzas();

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
      collection(db, "districts"),
      orderBy("name")
    );


  const snapshot =
    await getDocs(districtQuery);


  snapshot.forEach((districtDoc) => {

    const data =
      districtDoc.data();


    // Add form dropdown

    const option =
      document.createElement("option");

    option.value =
      districtDoc.id;

    option.textContent =
      data.name;

    districtSelect.appendChild(
      option
    );


    // Add filter dropdown

    const filterOption =
      document.createElement("option");

    filterOption.value =
      districtDoc.id;

    filterOption.textContent =
      data.name;

    filterDistrict.appendChild(
      filterOption
    );

  });

}


// ========================================
// LOAD REVENUE CIRCLES FOR DISTRICT
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
    await getDocs(circleQuery);


  snapshot.forEach((circleDoc) => {

    const data =
      circleDoc.data();


    // Only active circles

    if (
      data.status !== "active"
    ) {

      return;

    }


    const option =
      document.createElement("option");

    option.value =
      circleDoc.id;

    option.textContent =
      data.name;

    targetSelect.appendChild(
      option
    );

  });

}


// ========================================
// DISTRICT → REVENUE CIRCLE
// ========================================

districtSelect.addEventListener(
  "change",
  async () => {

    await loadRevenueCircles(
      districtSelect.value,
      circleSelect,
      false
    );

  }
);


// ========================================
// ADD MOUZA
// ========================================

mouzaForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const districtId =
      districtSelect.value;


    const circleId =
      circleSelect.value;


    const mouzaName =
      document
        .getElementById("mouzaName")
        .value
        .trim();


    const status =
      document
        .getElementById("mouzaStatus")
        .value;


    if (!districtId) {

      alert(
        "Please select District."
      );

      return;

    }


    if (!circleId) {

      alert(
        "Please select Revenue Circle."
      );

      return;

    }


    if (!mouzaName) {

      alert(
        "Please enter Mouza Name."
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


      const [
        districtSnap,
        circleSnap
      ] =
        await Promise.all([
          getDoc(districtRef),
          getDoc(circleRef)
        ]);


      if (
        !districtSnap.exists()
      ) {

        alert(
          "District not found."
        );

        return;

      }


      if (
        !circleSnap.exists()
      ) {

        alert(
          "Revenue Circle not found."
        );

        return;

      }


      const districtData =
        districtSnap.data();


      const circleData =
        circleSnap.data();


      // Security relationship check

      if (
        circleData.districtId !==
        districtId
      ) {

        alert(
          "Selected Revenue Circle does not belong to this District."
        );

        return;

      }


      const mouzaId =
        `${districtId}__${circleId}__${createId(mouzaName)}`;


      const mouzaRef =
        doc(
          db,
          "mouzas",
          mouzaId
        );


      const existing =
        await getDoc(mouzaRef);


      if (
        existing.exists()
      ) {

        alert(
          "This Mouza already exists under the selected Revenue Circle."
        );

        return;

      }


      await setDoc(
        mouzaRef,
        {

          mouzaId:
            mouzaId,

          name:
            mouzaName,

          districtId:
            districtId,

          districtName:
            districtData.name,

          revenueCircleId:
            circleId,

          revenueCircleName:
            circleData.name,

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
        "Mouza added successfully."
      );


      mouzaForm.reset();

      circleSelect.innerHTML =
        `<option value="">
          Select Revenue Circle
         </option>`;


      await loadMouzas();


    } catch (error) {

      console.error(
        "Add Mouza error:",
        error
      );


      alert(
        "Unable to add Mouza."
      );

    }

  }
);


// ========================================
// LOAD MOUZAS
// ========================================

async function loadMouzas() {

  mouzaList.innerHTML =
    "<p>Loading Mouzas...</p>";


  try {

    const mouzaQuery =
      query(
        collection(
          db,
          "mouzas"
        ),
        orderBy("name")
      );


    const snapshot =
      await getDocs(mouzaQuery);


    if (snapshot.empty) {

      mouzaList.innerHTML =
        "<p>No Mouzas added yet.</p>";

      return;

    }


    const selectedDistrict =
      filterDistrict.value;


    const selectedCircle =
      filterCircle.value;


    const selectedStatus =
      filterStatus.value;


    const searchText =
      searchMouza.value
        .trim()
        .toLowerCase();


    let html = "";

    let visibleCount = 0;


    snapshot.forEach(
      (mouzaDoc) => {

        const data =
          mouzaDoc.data();


        const status =
          data.status ||
          "inactive";


        // District filter

        if (
          selectedDistrict &&
          data.districtId !==
            selectedDistrict
        ) {

          return;

        }


        // Circle filter

        if (
          selectedCircle &&
          data.revenueCircleId !==
            selectedCircle
        ) {

          return;

        }


        // Status filter

        if (
          selectedStatus &&
          status !==
            selectedStatus
        ) {

          return;

        }


        // Search

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
                editMouza(
                  '${mouzaDoc.id}'
                )
              "
            >
              Edit
            </button>


            <button
              class="btn"
              onclick="
                toggleMouzaStatus(
                  '${mouzaDoc.id}',
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

      mouzaList.innerHTML =
        "<p>No matching Mouza found.</p>";

      return;

    }


    mouzaList.innerHTML =
      html;


  } catch (error) {

    console.error(
      "Load Mouzas error:",
      error
    );


    mouzaList.innerHTML =
      "<p>Unable to load Mouzas.</p>";

  }

}


// ========================================
// FILTER DISTRICT → CIRCLE
// ========================================

filterDistrict.addEventListener(
  "change",
  async () => {

    await loadRevenueCircles(
      filterDistrict.value,
      filterCircle,
      true
    );

    await loadMouzas();

  }
);


// ========================================
// FILTER CIRCLE
// ========================================

filterCircle.addEventListener(
  "change",
  () => {

    loadMouzas();

  }
);


// ========================================
// SEARCH
// ========================================

searchMouza.addEventListener(
  "input",
  () => {

    loadMouzas();

  }
);


// ========================================
// STATUS FILTER
// ========================================

filterStatus.addEventListener(
  "change",
  () => {

    loadMouzas();

  }
);


// ========================================
// ACTIVATE / DEACTIVATE
// ========================================

window.toggleMouzaStatus =
  async function (
    mouzaId,
    currentStatus
  ) {

    const newStatus =
      currentStatus === "active"
        ? "inactive"
        : "active";


    const action =
      newStatus === "active"
        ? "activate"
        : "deactivate";


    if (
      !confirm(
        `Are you sure you want to ${action} this Mouza?`
      )
    ) {

      return;

    }


    try {

      const mouzaRef =
        doc(
          db,
          "mouzas",
          mouzaId
        );


      await updateDoc(
        mouzaRef,
        {

          status:
            newStatus,

          updatedAt:
            serverTimestamp(),

          updatedBy:
            auth.currentUser.uid

        }
      );


      alert(
        `Mouza ${action}d successfully.`
      );


      await loadMouzas();


    } catch (error) {

      console.error(
        "Status update error:",
        error
      );


      alert(
        "Unable to update Mouza."
      );

    }

  };


// ========================================
// EDIT MOUZA
// ========================================

window.editMouza =
  async function (mouzaId) {

    try {

      const mouzaRef =
        doc(
          db,
          "mouzas",
          mouzaId
        );


      const mouzaSnap =
        await getDoc(mouzaRef);


      if (
        !mouzaSnap.exists()
      ) {

        alert(
          "Mouza not found."
        );

        return;

      }


      const data =
        mouzaSnap.data();


      document.getElementById(
        "editMouzaId"
      ).value =
        mouzaId;


      document.getElementById(
        "editMouzaName"
      ).value =
        data.name || "";


      document.getElementById(
        "editMouzaStatus"
      ).value =
        data.status ||
        "active";


      editMouzaModal.style.display =
        "block";


    } catch (error) {

      console.error(
        "Edit Mouza error:",
        error
      );


      alert(
        "Unable to open Mouza."
      );

    }

  };


// ========================================
// SAVE EDIT
// ========================================

if (
  saveMouzaEditBtn
) {

  saveMouzaEditBtn.addEventListener(
    "click",
    async () => {

      const mouzaId =
        document.getElementById(
          "editMouzaId"
        ).value;


      const name =
        document.getElementById(
          "editMouzaName"
        ).value.trim();


      const status =
        document.getElementById(
          "editMouzaStatus"
        ).value;


      if (!name) {

        alert(
          "Mouza Name is required."
        );

        return;

      }


      try {

        const mouzaRef =
          doc(
            db,
            "mouzas",
            mouzaId
          );


        await updateDoc(
          mouzaRef,
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
          "Mouza updated successfully."
        );


        editMouzaModal.style.display =
          "none";


        await loadMouzas();


      } catch (error) {

        console.error(
          "Update Mouza error:",
          error
        );


        alert(
          "Unable to update Mouza."
        );

      }

    }
  );

}


// ========================================
// CANCEL EDIT
// ========================================

if (
  cancelMouzaEditBtn
) {

  cancelMouzaEditBtn.addEventListener(
    "click",
    () => {

      editMouzaModal.style.display =
        "none";

    }
  );

}


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
      ""
    );

}


// ========================================
// HTML SECURITY
// ========================================

function escapeHtml(value) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


// ========================================
// LOGOUT
// ========================================

window.logout =
  async function () {

    try {

      await signOut(auth);

      window.location.href =
        "login.html";

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

    }

  };
