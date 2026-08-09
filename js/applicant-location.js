import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


const districtSelect =
  document.getElementById("districtSelect");

const circleSelect =
  document.getElementById("circleSelect");

const mouzaSelect =
  document.getElementById("mouzaSelect");

const lotSelect =
  document.getElementById("lotSelect");

const villageSelect =
  document.getElementById("villageSelect");


// ========================================
// LOAD DISTRICTS
// ========================================

async function loadDistricts() {

  try {

    const snapshot =
      await getDocs(
        collection(db, "districts")
      );

    districtSelect.innerHTML =
      `<option value="">
        Select District
      </option>`;

    const districts = [];

    snapshot.forEach((item) => {

      const data = item.data();

      if (data.status === "active") {

        districts.push({
          id: item.id,
          name: data.name || item.id
        });

      }

    });

    districts.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    districts.forEach((district) => {

      const option =
        document.createElement("option");

      option.value =
        district.id;

      option.textContent =
        district.name;

      districtSelect.appendChild(option);

    });

  } catch (error) {

    console.error(
      "District loading error:",
      error
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

    if (!districtId) {

      circleSelect.innerHTML =
        `<option value="">
          Select Revenue Circle
        </option>`;

      return;
    }

    try {

      const snapshot =
        await getDocs(
          collection(
            db,
            "revenueCircles"
          )
        );

      circleSelect.innerHTML =
        `<option value="">
          Select Revenue Circle
        </option>`;

      let found = 0;

      snapshot.forEach((item) => {

        const data =
          item.data();

        const circleDistrict =
          String(
            data.districtId || ""
          )
          .trim()
          .toLowerCase();

        const selectedDistrict =
          String(districtId)
          .trim()
          .toLowerCase();

        if (
          circleDistrict ===
          selectedDistrict
        ) {

          if (
            data.status === "active"
          ) {

            const option =
              document.createElement(
                "option"
              );

            option.value =
              item.id;

            option.textContent =
              data.name || item.id;

            circleSelect.appendChild(
              option
            );

            found++;

          }

        }

      });

      if (found === 0) {

        circleSelect.innerHTML =
          `<option value="">
            No Revenue Circle Found
          </option>`;

      }

    } catch (error) {

      console.error(
        "Revenue Circle error:",
        error
      );

      circleSelect.innerHTML =
        `<option value="">
          Error loading Revenue Circle
        </option>`;

    }

  }
);


// ========================================
// INITIAL LOAD
// ========================================

loadDistricts();
