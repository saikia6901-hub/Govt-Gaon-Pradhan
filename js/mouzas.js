import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ========================================
// ELEMENTS
// ========================================

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
// START
// ========================================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href = "login.html";

    return;
  }

  try {

    const userRef =
      doc(db, "users", user.uid);

    const userSnap =
      await getDoc(userRef);

    if (!userSnap.exists()) {

      alert("User profile not found.");

      window.location.href =
        "login.html";

      return;
    }

    const userData =
      userSnap.data();

    if (userData.role !== "super_admin") {

      alert(
        "Access denied. Super Admin only."
      );

      window.location.href =
        "dashboard.html";

      return;
    }


    // ====================================
    // SHOW ADMIN EMAIL
    // ====================================

    const adminEmail =
      document.getElementById("adminEmail");

    if (adminEmail) {

      adminEmail.textContent =
        "Logged in as: " +
        (user.email || "Administrator");

    }


    // ====================================
    // INITIAL LOAD
    // ====================================

    await loadDistricts();

    await loadMouzas();


  } catch (error) {

    console.error(
      "Mouza page authentication error:",
      error
    );

    alert(
      "Unable to load Mouza Management.\n\n" +
      (error.code || "Unknown error") +
      "\n\n" +
      (error.message || error)
    );

  }

});


// ========================================
// LOAD DISTRICTS
// ========================================

async function loadDistricts() {

  if (!districtSelect) {
    return;
  }


  districtSelect.innerHTML =
    `<option value="">
      Select District
    </option>`;


  if (filterDistrict) {

    filterDistrict.innerHTML =
      `<option value="">
        All Districts
      </option>`;

  }


  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "districts"
        )
      );


    const districts = [];


    snapshot.forEach(
      (districtDoc) => {

        const data =
          districtDoc.data();


        if (
          data.status &&
          data.status !== "active"
        ) {

          return;
        }


        districts.push({

          id:
            districtDoc.id,

          name:
            data.name || ""

        });

      }
    );


    // Sort in browser.
    districts.sort(
      (a, b) =>
        a.name.localeCompare(
          b.name
        )
    );


    districts.forEach(
      (district) => {


        // ==============================
        // FORM DISTRICT
        // ==============================

        const option =
          document.createElement(
            "option"
          );

        option.value =
          district.id;

        option.textContent =
          district.name;

        districtSelect.appendChild(
          option
        );


        // ==============================
        // FILTER DISTRICT
        // ==============================

        if (filterDistrict) {

          const filterOption =
            document.createElement(
              "option"
            );

          filterOption.value =
            district.id;

          filterOption.textContent =
            district.name;

          filterDistrict.appendChild(
            filterOption
          );

        }

      }
    );


  } catch (error) {

    console.error(
      "Load districts error:",
      error
    );


    districtSelect.innerHTML =
      `<option value="">
        Unable to load districts
      </option>`;


    alert(
      "Unable to load Districts.\n\n" +
      (error.code || "Unknown error") +
      "\n\n" +
      (error.message || error)
    );

  }

}


// ========================================
// LOAD REVENUE CIRCLES
// ========================================
// IMPORTANT:
// No where + orderBy query.
// This avoids Firestore composite-index problem.
// ========================================

async function loadRevenueCircles(
  districtId,
  targetSelect,
  includeAllOption = false
) {

  if (!targetSelect) {
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

    // ====================================
    // GET ALL CIRCLES
    // ====================================

    const snapshot =
      await getDocs(
        collection(
          db,
          "revenueCircles"
        )
      );


    const circles = [];


    snapshot.forEach(
      (circleDoc) => {

        const data =
          circleDoc.data();


        // District relationship
        if (
          data.districtId !==
          districtId
        ) {

          return;
        }


        // Only active circles
        if (
          data.status &&
          data.status !== "active"
        ) {

          return;
        }


        circles.push({

          id:
            circleDoc.id,

          name:
            data.name || "",

          districtId:
            data.districtId

        });

      }
    );


    // ====================================
    // SORT BY NAME
    // ====================================

    circles.sort(
      (a, b) =>
        a.name.localeCompare(
          b.name
        )
    );


    // ====================================
    // ADD OPTIONS
    // ====================================

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


    // ====================================
    // NO CIRCLE FOUND
    // ====================================

    if (
      circles.length === 0
    ) {

      targetSelect.innerHTML =
        includeAllOption
          ? `<option value="">
              No Revenue Circles
            </option>`
          : `<option value="">
              No Revenue Circles found
            </option>`;

    }


  } catch (error) {

    console.error(
      "Load Revenue Circles error:",
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
// DISTRICT → REVENUE CIRCLE
// ========================================

if (districtSelect) {

  districtSelect.addEventListener(
    "change",
    async () => {

      const districtId =
        districtSelect.value;


      await loadRevenueCircles(
        districtId,
        circleSelect,
        false
      );

    }
  );

}


// ========================================
// ADD MOUZA
// ========================================

if (mouzaForm) {

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
          .getElementById(
            "mouzaName"
          )
          .value
          .trim();


      const status =
        document
          .getElementById(
            "mouzaStatus"
          )
          .value;


      // ==================================
      // VALIDATION
      // ==================================

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

        // ==================================
        // GET DISTRICT
        // ==================================

        const districtSnap =
          await getDoc(
            doc(
              db,
              "districts",
              districtId
            )
          );


        // ==================================
        // GET CIRCLE
        // ==================================

        const circleSnap =
          await getDoc(
            doc(
              db,
              "revenueCircles",
              circleId
            )
          );


        if (
          !districtSnap.exists()
        ) {

          alert(
            "Selected District does not exist."
          );

          return;
        }


        if (
          !circleSnap.exists()
        ) {

          alert(
            "Selected Revenue Circle does not exist."
          );

          return;
        }


        const districtData =
          districtSnap.data();


        const circleData =
          circleSnap.data();


        // ==================================
        // SECURITY RELATIONSHIP CHECK
        // ==================================

        if (
          circleData.districtId !==
          districtId
        ) {

          alert(
            "Selected Revenue Circle does not belong to this District."
          );

          return;
        }


        // ==================================
        // CREATE STABLE MOUZA ID
        // ==================================

        const mouzaId =
          `${districtId}__${circleId}__${createId(
            mouzaName
          )}`;


        const mouzaRef =
          doc(
            db,
            "mouzas",
            mouzaId
          );


        // ==================================
        // DUPLICATE CHECK
        // ==================================

        const existing =
          await getDoc(
            mouzaRef
          );


        if (
          existing.exists()
        ) {

          alert(
            "This Mouza already exists under the selected Revenue Circle."
          );

          return;
        }


        // ==================================
        // SAVE
        // ==================================

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
              districtData.name || "",

            revenueCircleId:
              circleId,

            revenueCircleName:
              circleData.name || "",

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


        // ==================================
        // RESET FORM
        // ==================================

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
          "Unable to add Mouza.\n\n" +
          (error.code || "Unknown error") +
          "\n\n" +
          (error.message || error)
        );

      }

    }
  );

}


// ========================================
// LOAD MOUZAS
// ========================================

async function loadMouzas() {

  if (!mouzaList) {
    return;
  }


  mouzaList.innerHTML =
    "<p>Loading Mouzas...</p>";


  try {

    // No orderBy here.
    // Sort locally to avoid index issues.

    const snapshot =
      await getDocs(
        collection(
          db,
          "mouzas"
        )
      );


    if (
      snapshot.empty
    ) {

      mouzaList.innerHTML =
        "<p>No Mouzas added yet.</p>";

      return;
    }


    const selectedDistrict =
      filterDistrict
        ? filterDistrict.value
        : "";


    const selectedCircle =
      filterCircle
        ? filterCircle.value
        : "";


    const selectedStatus =
      filterStatus
        ? filterStatus.value
        : "";


    const searchText =
      searchMouza
        ? searchMouza.value
            .trim()
            .toLowerCase()
        : "";


    const mouzas = [];


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


        // Search filter

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


        mouzas.push({

          id:
            mouzaDoc.id,

          data:
            data,

          status:
            status

        });

      }
    );


    // ====================================
    // SORT
    // ====================================

    mouzas.sort(
      (a, b) =>
        String(
          a.data.name || ""
        ).localeCompare(
          String(
            b.data.name || ""
          )
        )
    );


    if (
      mouzas.length === 0
    ) {

      mouzaList.innerHTML =
        "<p>No matching Mouza found.</p>";

      return;
    }


    let html = "";


    mouzas.forEach(
      (item) => {

        const data =
          item.data;

        const status =
          item.status;


        const action =
          status === "active"
            ? "Deactivate"
            : "Activate";


        const statusText =
          status === "active"
            ? "Active"
            : "Inactive";


        html += `

          <div
            class="card"
            style="margin-bottom:15px;"
          >

            <h3>
              ${escapeHtml(
                data.name || ""
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
                ${statusText}
              </strong>
            </p>


            <button
              class="btn"
              onclick="editMouza('${item.id}')"
            >
              Edit
            </button>


            <button
              class="btn"
              onclick="toggleMouzaStatus(
                '${item.id}',
                '${status}'
              )"
            >
              ${action}
            </button>

          </div>

        `;

      }
    );


    mouzaList.innerHTML =
      html;


  } catch (error) {

    console.error(
      "Load Mouzas error:",
      error
    );


    mouzaList.innerHTML =
      "<p>Unable to load Mouzas.</p>";


    alert(
      "Unable to load Mouzas.\n\n" +
      (error.code || "Unknown error") +
      "\n\n" +
      (error.message || error)
    );

  }

}


// ========================================
// FILTER DISTRICT → CIRCLE
// ========================================

if (filterDistrict) {

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

}


// ========================================
// FILTER CIRCLE
// ========================================

if (filterCircle) {

  filterCircle.addEventListener(
    "change",
    async () => {

      await loadMouzas();

    }
  );

}


// ========================================
// SEARCH
// ========================================

if (searchMouza) {

  searchMouza.addEventListener(
    "input",
    async () => {

      await loadMouzas();

    }
  );

}


// ========================================
// STATUS FILTER
// ========================================

if (filterStatus) {

  filterStatus.addEventListener(
    "change",
    async () => {

      await loadMouzas();

    }
  );

}


// ========================================
// EDIT MOUZA
// ========================================

window.editMouza =
  async function (mouzaId) {

    try {

      const mouzaSnap =
        await getDoc(
          doc(
            db,
            "mouzas",
            mouzaId
          )
        );


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
        "Unable to open Mouza.\n\n" +
        (error.code || "Unknown error") +
        "\n\n" +
        (error.message || error)
      );

    }

  };


// ========================================
// SAVE EDIT
// ========================================

if (saveMouzaEditBtn) {

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
        return;
      }


      try {

        await updateDoc(
          doc(
            db,
            "mouzas",
            mouzaId
          ),
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
          "Unable to update Mouza.\n\n" +
          (error.code || "Unknown error") +
          "\n\n" +
          (error.message || error)
        );

      }

    }
  );

}


// ========================================
// CANCEL EDIT
// ========================================

if (cancelMouzaEditBtn) {

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

  return String(name)

    .toLowerCase()

    .trim()

    .replace(
      /[^a-z0-9]+/g,
      "-"
    )

    .replace(
      /^-+|-+$/g,
      "");

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
