import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ========================================
// ELEMENTS
// ========================================

const form =
  document.getElementById("districtForm");

const districtList =
  document.getElementById("districtList");

const importButton =
  document.getElementById("importDistrictsBtn");

const importStatus =
  document.getElementById("importStatus");

const editModal =
  document.getElementById("editModal");

const saveEditBtn =
  document.getElementById("saveEditBtn");

const cancelEditBtn =
  document.getElementById("cancelEditBtn");


// ========================================
// OFFICIAL DISTRICTS
// ========================================

const officialDistricts = [

  "Bajali",
  "Baksa",
  "Barpeta",
  "Biswanath",
  "Bongaigaon",
  "Cachar",
  "Charaideo",
  "Chirang",
  "Darrang",
  "Dhemaji",
  "Dhubri",
  "Dibrugarh",
  "Dima Hasao",
  "Goalpara",
  "Golaghat",
  "Hailakandi",
  "Hojai",
  "Jorhat",
  "Kamrup",
  "Kamrup Metropolitan",
  "Karbi Anglong",
  "Kokrajhar",
  "Lakhimpur",
  "Majuli",
  "Morigaon",
  "Nagaon",
  "Nalbari",
  "Sivasagar",
  "Sonitpur",
  "Shribhumi",
  "South Salmara-Mancachar",
  "Tamulpur",
  "Tinsukia",
  "Udalguri",
  "West Karbi Anglong"

];


// ========================================
// CREATE DISTRICT ID
// ========================================

function createDistrictId(name) {

  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

}


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
      "Logged in as: " +
      user.email;


    loadDistricts();


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
// ADD DISTRICT
// ========================================

if (form) {

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const name =
        document
          .getElementById(
            "districtName"
          )
          .value
          .trim();


      const code =
        document
          .getElementById(
            "districtCode"
          )
          .value
          .trim()
          .toUpperCase();


      const status =
        document
          .getElementById(
            "districtStatus"
          )
          .value;


      if (!name || !code) {

        alert(
          "Please enter District Name and District Code."
        );

        return;

      }


      try {

        const districtId =
          createDistrictId(name);


        const districtRef =
          doc(
            db,
            "districts",
            districtId
          );


        const existing =
          await getDoc(
            districtRef
          );


        if (existing.exists()) {

          alert(
            "This district already exists."
          );

          return;

        }


        await setDoc(
          districtRef,
          {

            districtId:
              districtId,

            name:
              name,

            code:
              code,

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
          "District added successfully."
        );


        form.reset();

        loadDistricts();


      } catch (error) {

        console.error(
          "Error adding district:",
          error
        );

        alert(
          "Unable to add district."
        );

      }

    }
  );

}


// ========================================
// LOAD DISTRICTS
// ========================================

async function loadDistricts() {

  districtList.innerHTML =
    "<p>Loading districts...</p>";


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


    if (snapshot.empty) {

      districtList.innerHTML =
        "<p>No districts added yet.</p>";

      return;

    }


    let html = "";


    snapshot.forEach(
      (documentSnapshot) => {

        const data =
          documentSnapshot.data();


        const districtId =
          documentSnapshot.id;


        const status =
          data.status ||
          "inactive";


        const statusText =
          status === "active"
            ? "Active"
            : "Inactive";


        const actionText =
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
                data.name
              )}
            </h3>


            <p>
              Code:
              <strong>
                ${escapeHtml(
                  data.code || ""
                )}
              </strong>
            </p>


            <p>
              State:
              <strong>
                Assam
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
              onclick="editDistrict('${districtId}')"
            >
              Edit
            </button>


            <button
              class="btn"
              onclick="toggleDistrictStatus(
                '${districtId}',
                '${status}'
              )"
            >
              ${actionText}
            </button>

          </div>

        `;

      }
    );


    districtList.innerHTML =
      html;


  } catch (error) {

    console.error(
      "Error loading districts:",
      error
    );


    districtList.innerHTML =
      "<p>Unable to load districts.</p>";

  }

}


// ========================================
// EDIT DISTRICT
// ========================================

window.editDistrict =
  async function (districtId) {

    try {

      const districtRef =
        doc(
          db,
          "districts",
          districtId
        );


      const snapshot =
        await getDoc(
          districtRef
        );


      if (!snapshot.exists()) {

        alert(
          "District not found."
        );

        return;

      }


      const data =
        snapshot.data();


      document.getElementById(
        "editDistrictId"
      ).value =
        districtId;


      document.getElementById(
        "editDistrictName"
      ).value =
        data.name || "";


      document.getElementById(
        "editDistrictCode"
      ).value =
        data.code || "";


      document.getElementById(
        "editDistrictStatus"
      ).value =
        data.status || "active";


      editModal.style.display =
        "block";


    } catch (error) {

      console.error(
        "Edit error:",
        error
      );

      alert(
        "Unable to open district."
      );

    }

  };


// ========================================
// SAVE EDIT
// ========================================

if (saveEditBtn) {

  saveEditBtn.addEventListener(
    "click",
    async () => {

      const districtId =
        document.getElementById(
          "editDistrictId"
        ).value;


      const name =
        document.getElementById(
          "editDistrictName"
        ).value.trim();


      const code =
        document.getElementById(
          "editDistrictCode"
        ).value
        .trim()
        .toUpperCase();


      const status =
        document.getElementById(
          "editDistrictStatus"
        ).value;


      if (!name || !code) {

        alert(
          "District Name and Code are required."
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


        await updateDoc(
          districtRef,
          {

            name:
              name,

            code:
              code,

            status:
              status,

            updatedAt:
              serverTimestamp(),

            updatedBy:
              auth.currentUser.uid

          }
        );


        alert(
          "District updated successfully."
        );


        editModal.style.display =
          "none";


        loadDistricts();


      } catch (error) {

        console.error(
          "Update error:",
          error
        );

        alert(
          "Unable to update district."
        );

      }

    }
  );

}


// ========================================
// CANCEL EDIT
// ========================================

if (cancelEditBtn) {

  cancelEditBtn.addEventListener(
    "click",
    () => {

      editModal.style.display =
        "none";

    }
  );

}


// ========================================
// ACTIVATE / DEACTIVATE
// ========================================

window.toggleDistrictStatus =
  async function (
    districtId,
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
        `Are you sure you want to ${action} this district?`
      );


    if (!confirmed) {

      return;

    }


    try {

      const districtRef =
        doc(
          db,
          "districts",
          districtId
        );


      await updateDoc(
        districtRef,
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
        `District ${action}d successfully.`
      );


      loadDistricts();


    } catch (error) {

      console.error(
        "Status update error:",
        error
      );


      alert(
        "Unable to update district status."
      );

    }

  };


// ========================================
// OFFICIAL DISTRICT IMPORT
// ========================================

if (importButton) {

  importButton.addEventListener(
    "click",
    async () => {

      const user =
        auth.currentUser;


      if (!user) {

        alert(
          "Please login first."
        );

        return;

      }


      importButton.disabled =
        true;

      importButton.textContent =
        "Importing...";


      importStatus.textContent =
        "Checking district data...";


      try {

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


        if (
          !userSnap.exists() ||
          userSnap.data().role !==
            "super_admin"
        ) {

          throw new Error(
            "Only Super Admin can import district data."
          );

        }


        let imported = 0;


        for (
          const districtName
          of officialDistricts
        ) {

          const districtId =
            createDistrictId(
              districtName
            );


          const districtRef =
            doc(
              db,
              "districts",
              districtId
            );


          await setDoc(
            districtRef,
            {

              districtId:
                districtId,

              name:
                districtName,

              state:
                "Assam",

              status:
                "active",

              source:
                "Government of Assam - General Administration Department",

              updatedAt:
                serverTimestamp(),

              updatedBy:
                user.uid

            },
            {
              merge: true
            }
          );


          imported++;

        }


        importStatus.textContent =
          `${imported} official districts processed successfully.`;


        alert(
          `${imported} official districts processed successfully.`
        );


        loadDistricts();


      } catch (error) {

        console.error(
          "Import error:",
          error
        );


        importStatus.textContent =
          "Import failed.";


        alert(
          "District import failed: " +
          error.message
        );


      } finally {

        importButton.disabled =
          false;

        importButton.textContent =
          "Import Official Districts";

      }

    }
  );

}


// ========================================
// HTML ESCAPE
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
