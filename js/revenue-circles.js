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
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ========================================
// ELEMENTS
// ========================================

const circleForm =
  document.getElementById("circleForm");

const districtSelect =
  document.getElementById("districtSelect");

const circleList =
  document.getElementById("circleList");

const filterDistrict =
  document.getElementById("filterDistrict");

const searchCircle =
  document.getElementById("searchCircle");

const filterStatus =
  document.getElementById("filterStatus");

const editCircleModal =
  document.getElementById("editCircleModal");

const saveCircleEditBtn =
  document.getElementById("saveCircleEditBtn");

const cancelCircleEditBtn =
  document.getElementById("cancelCircleEditBtn");

const adminEmail =
  document.getElementById("adminEmail");


// ========================================
// SUPER ADMIN AUTHENTICATION
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


    // Show logged-in email
    if (adminEmail) {

      adminEmail.textContent =
        "Logged in as: " +
        user.email;
    }


    // Load data
    await loadDistricts();

    await loadCircles();


  } catch (error) {

    console.error(
      "Authentication error:",
      error
    );


    alert(
      "AUTH ERROR:\n\n" +
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
    `<option value="">Loading districts...</option>`;


  if (filterDistrict) {

    filterDistrict.innerHTML =
      `<option value="">All Districts</option>`;
  }


  try {

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


    districtSelect.innerHTML =
      `<option value="">Select District</option>`;


    if (filterDistrict) {

      filterDistrict.innerHTML =
        `<option value="">All Districts</option>`;
    }


    if (snapshot.empty) {

      districtSelect.innerHTML =
        `<option value="">No districts found</option>`;

      return;
    }


    snapshot.forEach(
      (districtDoc) => {

        const data =
          districtDoc.data();


        // Add to main district dropdown
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


        // Add to filter dropdown
        if (filterDistrict) {

          const filterOption =
            document.createElement(
              "option"
            );


          filterOption.value =
            districtDoc.id;


          filterOption.textContent =
            data.name ||
            districtDoc.id;


          filterDistrict.appendChild(
            filterOption
          );
        }

      }
    );


  } catch (error) {

    console.error(
      "Error loading districts:",
      error
    );


    districtSelect.innerHTML =
      `<option value="">Unable to load districts</option>`;


    alert(
      "Unable to load districts.\n\n" +
      (error.code || "Unknown error") +
      "\n" +
      (error.message || error)
    );

  }

}


// ========================================
// ADD REVENUE CIRCLE
// ========================================

if (circleForm) {

  circleForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const districtId =
        districtSelect
          ? districtSelect.value
          : "";


      const circleName =
        document
          .getElementById("circleName")
          ?.value
          .trim() || "";


      const status =
        document
          .getElementById("circleStatus")
          ?.value || "active";


      if (!districtId) {

        alert(
          "Please select a district."
        );

        return;
      }


      if (!circleName) {

        alert(
          "Please enter Revenue Circle Name."
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


        const districtSnap =
          await getDoc(
            districtRef
          );


        if (!districtSnap.exists()) {

          alert(
            "Selected district does not exist."
          );

          return;
        }


        const districtData =
          districtSnap.data();


        const circleId =
          `${districtId}__${createId(
            circleName
          )}`;


        const circleRef =
          doc(
            db,
            "revenueCircles",
            circleId
          );


        const existing =
          await getDoc(
            circleRef
          );


        if (existing.exists()) {

          alert(
            "This Revenue Circle already exists under the selected district."
          );

          return;
        }


        await setDoc(
          circleRef,
          {

            circleId:
              circleId,

            name:
              circleName,

            districtId:
              districtId,

            districtName:
              districtData.name || "",

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
          "Revenue Circle added successfully."
        );


        circleForm.reset();


        await loadCircles();


      } catch (error) {

        console.error(
          "Error adding Revenue Circle:",
          error
        );


        alert(
          "Unable to add Revenue Circle.\n\n" +
          (error.code || "Unknown error") +
          "\n\n" +
          (error.message || error)
        );

      }

    }
  );

}


// ========================================
// LOAD REVENUE CIRCLES
// ========================================

async function loadCircles() {

  if (!circleList) {
    return;
  }


  circleList.innerHTML =
    "<p>Loading Revenue Circles...</p>";


  try {

    const circleQuery =
      query(
        collection(
          db,
          "revenueCircles"
        ),
        orderBy("name")
      );


    const snapshot =
      await getDocs(
        circleQuery
      );


    if (snapshot.empty) {

      circleList.innerHTML =
        "<p>No Revenue Circles added yet.</p>";

      return;
    }


    const selectedDistrict =
      filterDistrict
        ? filterDistrict.value
        : "";


    const selectedStatus =
      filterStatus
        ? filterStatus.value
        : "";


    const searchText =
      searchCircle
        ? searchCircle.value
            .trim()
            .toLowerCase()
        : "";


    let html = "";


    snapshot.forEach(
      (circleDoc) => {

        const data =
          circleDoc.data();


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


        // Status filter
        if (
          selectedStatus &&
          status !== selectedStatus
        ) {

          return;
        }


        // Search filter
        const circleName =
          String(
            data.name || ""
          ).toLowerCase();


        if (
          searchText &&
          !circleName.includes(
            searchText
          )
        ) {

          return;
        }


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
              Status:
              <strong>
                ${statusText}
              </strong>
            </p>


            <button
              class="btn"
              onclick="editCircle('${circleDoc.id}')"
            >
              Edit
            </button>


            <button
              class="btn"
              onclick="toggleCircleStatus(
                '${circleDoc.id}',
                '${status}'
              )"
            >
              ${action}
            </button>

          </div>

        `;

      }
    );


    if (!html) {

      circleList.innerHTML =
        "<p>No Revenue Circles match your filters.</p>";

      return;
    }


    circleList.innerHTML =
      html;


  } catch (error) {

    console.error(
      "Error loading Revenue Circles:",
      error
    );


    circleList.innerHTML =
      "<p>Unable to load Revenue Circles.</p>";


    alert(
      "Unable to load Revenue Circles.\n\n" +
      (error.code || "Unknown error") +
      "\n\n" +
      (error.message || error)
    );

  }

}


// ========================================
// ACTIVATE / DEACTIVATE
// ========================================

window.toggleCircleStatus =
  async function (
    circleId,
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


    const confirmed =
      confirm(
        `Are you sure you want to ${action} this Revenue Circle?`
      );


    if (!confirmed) {
      return;
    }


    try {

      const circleRef =
        doc(
          db,
          "revenueCircles",
          circleId
        );


      await updateDoc(
        circleRef,
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
        `Revenue Circle ${action}d successfully.`
      );


      await loadCircles();


    } catch (error) {

      console.error(
        "Status update error:",
        error
      );


      alert(
        "Unable to update status.\n\n" +
        (error.code || "Unknown error") +
        "\n" +
        (error.message || error)
      );

    }

  };


// ========================================
// CREATE SAFE ID
// ========================================

function createId(name) {

  return String(name)

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
// EDIT REVENUE CIRCLE
// ========================================

window.editCircle =
  async function (circleId) {

    try {

      const circleRef =
        doc(
          db,
          "revenueCircles",
          circleId
        );


      const circleSnap =
        await getDoc(
          circleRef
        );


      if (!circleSnap.exists()) {

        alert(
          "Revenue Circle not found."
        );

        return;
      }


      const data =
        circleSnap.data();


      const editId =
        document.getElementById(
          "editCircleId"
        );


      const editName =
        document.getElementById(
          "editCircleName"
        );


      const editStatus =
        document.getElementById(
          "editCircleStatus"
        );


      if (editId) {

        editId.value =
          circleId;
      }


      if (editName) {

        editName.value =
          data.name || "";
      }


      if (editStatus) {

        editStatus.value =
          data.status || "active";
      }


      if (editCircleModal) {

        editCircleModal.style.display =
          "block";
      }


    } catch (error) {

      console.error(
        "Edit Revenue Circle error:",
        error
      );


      alert(
        "Unable to open Revenue Circle.\n\n" +
        (error.code || "Unknown error") +
        "\n" +
        (error.message || error)
      );

    }

  };


// ========================================
// SAVE REVENUE CIRCLE EDIT
// ========================================

if (saveCircleEditBtn) {

  saveCircleEditBtn.addEventListener(
    "click",
    async () => {

      const circleId =
        document.getElementById(
          "editCircleId"
        )?.value || "";


      const name =
        document.getElementById(
          "editCircleName"
        )?.value
        .trim() || "";


      const status =
        document.getElementById(
          "editCircleStatus"
        )?.value || "active";


      if (!circleId) {

        alert(
          "Revenue Circle ID is missing."
        );

        return;
      }


      if (!name) {

        alert(
          "Revenue Circle Name is required."
        );

        return;
      }


      try {

        const circleRef =
          doc(
            db,
            "revenueCircles",
            circleId
          );


        await updateDoc(
          circleRef,
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
          "Revenue Circle updated successfully."
        );


        if (editCircleModal) {

          editCircleModal.style.display =
            "none";
        }


        await loadCircles();


      } catch (error) {

        console.error(
          "Update Revenue Circle error:",
          error
        );


        alert(
          "Unable to update Revenue Circle.\n\n" +
          (error.code || "Unknown error") +
          "\n" +
          (error.message || error)
        );

      }

    }
  );

}


// ========================================
// CANCEL EDIT
// ========================================

if (cancelCircleEditBtn) {

  cancelCircleEditBtn.addEventListener(
    "click",
    () => {

      if (editCircleModal) {

        editCircleModal.style.display =
          "none";
      }

    }
  );

}


// ========================================
// DISTRICT FILTER
// ========================================

if (filterDistrict) {

  filterDistrict.addEventListener(
    "change",
    () => {

      loadCircles();

    }
  );

}


// ========================================
// SEARCH REVENUE CIRCLE
// ========================================

if (searchCircle) {

  searchCircle.addEventListener(
    "input",
    () => {

      loadCircles();

    }
  );

}


// ========================================
// STATUS FILTER
// ========================================

if (filterStatus) {

  filterStatus.addEventListener(
    "change",
    () => {

      loadCircles();

    }
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


      alert(
        "Logout failed.\n\n" +
        (error.code || "Unknown error") +
        "\n" +
        (error.message || error)
      );

    }

  };
