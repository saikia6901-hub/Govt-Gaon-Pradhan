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
// BASIC ELEMENT CHECK
// ========================================

if (
  !mouzaForm ||
  !districtSelect ||
  !circleSelect ||
  !mouzaList ||
  !filterDistrict ||
  !filterCircle ||
  !searchMouza ||
  !filterStatus
) {

  console.error(
    "Mouza Management: Required HTML element missing."
  );

  alert(
    "Mouza Management page error:\n\n" +
    "Required HTML element is missing.\n\n" +
    "Please check mouza-management.html."
  );

}


// ========================================
// SUPER ADMIN AUTH CHECK
// ========================================

onAuthStateChanged(
  auth,
  async (user) => {

    console.log(
      "Auth state:",
      user
    );


    if (!user) {

      console.warn(
        "No authenticated user."
      );

      window.location.href =
        "login.html";

      return;

    }


    try {

      // ==================================
      // LOAD USER PROFILE
      // ==================================

      const userRef =
        doc(
          db,
          "users",
          user.uid
        );


      const userSnap =
        await getDoc(
          userRef
        );


      if (!userSnap.exists()) {

        alert(
          "USER PROFILE ERROR\n\n" +
          "User profile not found in Firestore.\n\n" +
          "UID:\n" +
          user.uid
        );

        return;

      }


      const userData =
        userSnap.data();


      console.log(
        "User profile:",
        userData
      );


      // ==================================
      // SUPER ADMIN CHECK
      // ==================================

      if (
        userData.role !==
        "super_admin"
      ) {

        alert(
          "ACCESS DENIED\n\n" +
          "Super Admin access required.\n\n" +
          "Current role: " +
          (userData.role || "undefined")
        );

        window.location.href =
          "dashboard.html";

        return;

      }


      // ==================================
      // SHOW LOGGED-IN EMAIL
      // ==================================

      const adminEmail =
        document.getElementById(
          "adminEmail"
        );


      if (adminEmail) {

        adminEmail.textContent =
          "Logged in as: " +
          (
            user.email ||
            "Unknown email"
          );

      }


      console.log(
        "Super Admin verified."
      );


      // ==================================
      // LOAD PAGE DATA
      // ==================================

      await loadDistricts();

      await loadMouzas();


      console.log(
        "Mouza Management loaded successfully."
      );


    } catch (error) {

      console.error(
        "Mouza Authentication / Loading error:",
        error
      );


      alert(
        "MOUZA PAGE ERROR\n\n" +
        (error.code || "Unknown error") +
        "\n\n" +
        (error.message || error)
      );

    }

  }
);


// ========================================
// LOAD DISTRICTS
// ========================================

async function loadDistricts() {

  try {

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


    console.log(
      "District count:",
      snapshot.size
    );


    snapshot.forEach(
      (districtDoc) => {

        const data =
          districtDoc.data();


        // ================================
        // ADD FORM DISTRICT
        // ================================

        const option =
          document.createElement(
            "option"
          );

        option.value =
          districtDoc.id;

        option.textContent =
          data.name || districtDoc.id;

        districtSelect.appendChild(
          option
        );


        // ================================
        // ADD FILTER DISTRICT
        // ================================

        const filterOption =
          document.createElement(
            "option"
          );

        filterOption.value =
          districtDoc.id;

        filterOption.textContent =
          data.name || districtDoc.id;

        filterDistrict.appendChild(
          filterOption
        );

      }
    );


  } catch (error) {

    console.error(
      "Load districts error:",
      error
    );


    alert(
      "UNABLE TO LOAD DISTRICTS\n\n" +
      (error.code || "Unknown error") +
      "\n\n" +
      (error.message || error)
    );

  }

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
    return;
  }


  // ======================================
  // RESET DROPDOWN
  // ======================================

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

    console.log(
      "Loading Revenue Circles for district:",
      districtId
    );


    // IMPORTANT:
    // No orderBy here.
    // This avoids Firestore composite-index problem.
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


    console.log(
      "Revenue Circle count:",
      snapshot.size
    );


    const circles = [];


    snapshot.forEach(
      (circleDoc) => {

        const data =
          circleDoc.data();


        // Only active circles
        if (
          data.status !==
          "active"
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


    // ==================================
    // SORT IN JAVASCRIPT
    // ==================================

    circles.sort(
      (a, b) =>
        a.name.localeCompare(
          b.name,
          undefined,
          {
            sensitivity:
              "base"
          }
        )
    );


    // ==================================
    // ADD OPTIONS
    // ==================================

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


    if (
      circles.length === 0
    ) {

      console.log(
        "No active Revenue Circles found for district:",
        districtId
      );

    }


  } catch (error) {

    console.error(
      "Load Revenue Circles error:",
      error
    );


    targetSelect.innerHTML =
      includeAllOption
        ? `<option value="">
            All Revenue Circles
          </option>`
        : `<option value="">
            Unable to load Revenue Circles
          </option>`;


    alert(
      "UNABLE TO LOAD REVENUE CIRCLES\n\n" +
      (error.code || "Unknown error") +
      "\n\n" +
      (error.message || error)
    );

  }

}


// ========================================
// DISTRICT → REVENUE CIRCLE
// ========================================

districtSelect.addEventListener(
  "change",
  async () => {

    const districtId =
      districtSelect.value;


    circleSelect.innerHTML =
      `<option value="">
        Loading Revenue Circles...
      </option>`;


    await loadRevenueCircles(
      districtId,
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

      const districtRef =
        doc(
          db,
          "districts",
          districtId
        );


      // ==================================
      // GET CIRCLE
      // ==================================

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

          getDoc(
            districtRef
          ),

          getDoc(
            circleRef
          )

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


      // ==================================
      // RELATIONSHIP CHECK
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
        `${districtId}__${circleId}__${createId(mouzaName)}`;


      const mouzaRef =
        doc(
          db,
          "mouzas",
          mouzaId
        );


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
        "UNABLE TO ADD MOUZA\n\n" +
        (error.code || "Unknown error") +
        "\n\n" +
        (error.message || error)
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

    // IMPORTANT:
    // Only orderBy.
    // No composite query required.
    const mouzaQuery =
      query(
        collection(
          db,
          "mouzas"
        ),
        orderBy("name")
      );


    const snapshot =
      await getDocs(
        mouzaQuery
      );


    console.log(
      "Mouza count:",
      snapshot.size
    );


    if (
      snapshot.empty
    ) {

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


        // =================================
        // DISTRICT FILTER
        // =================================

        if (
          selectedDistrict &&
          data.districtId !==
            selectedDistrict
        ) {

          return;

        }


        // =================================
        // CIRCLE FILTER
        // =================================

        if (
          selectedCircle &&
          data.revenueCircleId !==
            selectedCircle
        ) {

          return;

        }


        // =================================
        // STATUS FILTER
        // =================================

        if (
          selectedStatus &&
          status !==
            selectedStatus
        ) {

          return;

        }


        // =================================
        // SEARCH
        // =================================

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
                ${
                  status === "active"
                    ? "Active"
                    : "Inactive"
                }
              </strong>
            </p>


            <button
              class="btn"
              onclick="editMouza('${mouzaDoc.id}')"
            >
              Edit
            </button>


            <button
              class="btn"
              onclick="toggleMouzaStatus(
                '${mouzaDoc.id}',
                '${status}'
              )"
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


    alert(
      "UNABLE TO LOAD MOUZAS\n\n" +
      (error.code || "Unknown error") +
      "\n\n" +
      (error.message || error)
    );

  }

}


// ========================================
// FILTER DISTRICT → CIRCLE
// ========================================

filterDistrict.addEventListener(
  "change",
  async () => {

    filterCircle.innerHTML =
      `<option value="">
        Loading Revenue Circles...
      </option>`;


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
  async () => {

    await loadMouzas();

  }
);


// ========================================
// SEARCH
// ========================================

searchMouza.addEventListener(
  "input",
  async () => {

    await loadMouzas();

  }
);


// ========================================
// STATUS FILTER
// ========================================

filterStatus.addEventListener(
  "change",
  async () => {

    await loadMouzas();

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
        "UNABLE TO UPDATE MOUZA\n\n" +
        (error.code || "Unknown error") +
        "\n\n" +
        (error.message || error)
      );

    }

  };


// ========================================
// EDIT MOUZA
// ========================================

window.editMouza =
  async function (
    mouzaId
  ) {

    try {

      const mouzaRef =
        doc(
          db,
          "mouzas",
          mouzaId
        );


      const mouzaSnap =
        await getDoc(
          mouzaRef
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
        data.status || "active";


      editMouzaModal.style.display =
        "block";


    } catch (error) {

      console.error(
        "Edit Mouza error:",
        error
      );


      alert(
        "UNABLE TO OPEN MOUZA\n\n" +
        (error.code || "Unknown error") +
        "\n\n" +
        (error.message || error)
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
        ).value
          .trim();


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
          "UNABLE TO UPDATE MOUZA\n\n" +
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

function createId(
  name
) {

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

function escapeHtml(
  value
) {

  return String(
    value
  )

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

      await signOut(
        auth
      );


      window.location.href =
        "login.html";


    } catch (error) {

      console.error(
        "Logout error:",
        error
      );


      alert(
        "Logout failed.\n\n" +
        (error.code || "Unknown error") +
        "\n\n" +
        (error.message || error)
      );

    }

  };
