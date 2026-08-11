import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ========================================
// ELEMENTS
// ========================================

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
// HELPER
// ========================================

function resetSelect(select, text) {

    select.innerHTML =
        `<option value="">${text}</option>`;

}


// ========================================
// LOAD DISTRICTS
// ========================================

async function loadDistricts() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "districts")
            );


        resetSelect(
            districtSelect,
            "Select District"
        );


        const districts = [];


        snapshot.forEach((item) => {

            const data =
                item.data();


            if (
                data.status === "active"
            ) {

                districts.push({

                    id:
                        item.id,

                    name:
                        data.name || item.id

                });

            }

        });


        districts.sort(
            (a, b) =>
                a.name.localeCompare(b.name)
        );


        districts.forEach((district) => {

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

        });


    } catch (error) {

        console.error(
            "District loading error:",
            error
        );


        resetSelect(
            districtSelect,
            "Unable to load District"
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


        resetSelect(
            circleSelect,
            "Loading Revenue Circles..."
        );


        resetSelect(
            mouzaSelect,
            "Select Mouza"
        );


        resetSelect(
            lotSelect,
            "Select Lot"
        );


        resetSelect(
            villageSelect,
            "Select Village"
        );


        if (!districtId) {

            resetSelect(
                circleSelect,
                "Select Revenue Circle"
            );

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


            resetSelect(
                circleSelect,
                "Select Revenue Circle"
            );


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
                    String(
                        districtId
                    )
                    .trim()
                    .toLowerCase();


                if (
                    circleDistrict ===
                    selectedDistrict &&
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

            });


            if (found === 0) {

                resetSelect(
                    circleSelect,
                    "No Revenue Circle Found"
                );

            }


        } catch (error) {

            console.error(
                "Revenue Circle error:",
                error
            );


            resetSelect(
                circleSelect,
                "Error loading Revenue Circle"
            );

        }

    }
);


// ========================================
// REVENUE CIRCLE → MOUZA
// ========================================

circleSelect.addEventListener(
    "change",
    async () => {

        const circleId =
            circleSelect.value;


        resetSelect(
            mouzaSelect,
            "Loading Mouzas..."
        );


        resetSelect(
            lotSelect,
            "Select Lot"
        );


        resetSelect(
            villageSelect,
            "Select Village"
        );


        if (!circleId) {

            resetSelect(
                mouzaSelect,
                "Select Mouza"
            );

            return;

        }


        try {

            const snapshot =
                await getDocs(
                    collection(
                        db,
                        "mouzas"
                    )
                );


            resetSelect(
                mouzaSelect,
                "Select Mouza"
            );


            let found = 0;


            snapshot.forEach((item) => {

                const data =
                    item.data();


                const dataCircle =
                    String(
                        data.circleId ||
                        data.revenueCircleId ||
                        ""
                    )
                    .trim()
                    .toLowerCase();


                const selectedCircle =
                    String(
                        circleId
                    )
                    .trim()
                    .toLowerCase();


                if (
                    dataCircle ===
                    selectedCircle &&
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


                    mouzaSelect.appendChild(
                        option
                    );


                    found++;

                }

            });


            if (found === 0) {

                resetSelect(
                    mouzaSelect,
                    "No Mouza Found"
                );

            }


        } catch (error) {

            console.error(
                "Mouza loading error:",
                error
            );


            resetSelect(
                mouzaSelect,
                "Error loading Mouza"
            );

        }

    }
);


// ========================================
// MOUZA → LOT
// ========================================

mouzaSelect.addEventListener(
    "change",
    async () => {

        const mouzaId =
            mouzaSelect.value;


        resetSelect(
            lotSelect,
            "Loading Lots..."
        );


        resetSelect(
            villageSelect,
            "Select Village"
        );


        if (!mouzaId) {

            resetSelect(
                lotSelect,
                "Select Lot"
            );

            return;

        }


        try {

            const snapshot =
                await getDocs(
                    collection(
                        db,
                        "lots"
                    )
                );


            resetSelect(
                lotSelect,
                "Select Lot"
            );


            let found = 0;


            snapshot.forEach((item) => {

                const data =
                    item.data();


                const dataMouza =
                    String(
                        data.mouzaId || ""
                    )
                    .trim()
                    .toLowerCase();


                const selectedMouza =
                    String(
                        mouzaId
                    )
                    .trim()
                    .toLowerCase();


                if (
                    dataMouza ===
                    selectedMouza &&
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


                    lotSelect.appendChild(
                        option
                    );


                    found++;

                }

            });


            if (found === 0) {

                resetSelect(
                    lotSelect,
                    "No Lot Found"
                );

            }


        } catch (error) {

            console.error(
                "Lot loading error:",
                error
            );


            resetSelect(
                lotSelect,
                "Error loading Lot"
            );

        }

    }
);


// ========================================
// LOT → VILLAGE
// ========================================

lotSelect.addEventListener(
    "change",
    async () => {

        const lotId =
            lotSelect.value;


        resetSelect(
            villageSelect,
            "Loading Villages..."
        );


        if (!lotId) {

            resetSelect(
                villageSelect,
                "Select Village"
            );

            return;

        }


        try {

            const snapshot =
                await getDocs(
                    collection(
                        db,
                        "villages"
                    )
                );


            resetSelect(
                villageSelect,
                "Select Village"
            );


            let found = 0;


            snapshot.forEach((item) => {

                const data =
                    item.data();


                const dataLot =
                    String(
                        data.lotId || ""
                    )
                    .trim()
                    .toLowerCase();


                const selectedLot =
                    String(
                        lotId
                    )
                    .trim()
                    .toLowerCase();


                if (
                    dataLot ===
                    selectedLot &&
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


                    villageSelect.appendChild(
                        option
                    );


                    found++;

                }

            });


            if (found === 0) {

                resetSelect(
                    villageSelect,
                    "No Village Found"
                );

            }


        } catch (error) {

            console.error(
                "Village loading error:",
                error
            );


            resetSelect(
                villageSelect,
                "Error loading Village"
            );

        }

    }
);


// ========================================
// INITIAL LOAD
// ========================================

loadDistricts();
