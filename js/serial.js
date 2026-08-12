import { db } from "./firebase.js";

import {
    doc,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ========================================
// CERTIFICATE NUMBER
// ========================================

export async function getNextCertificateNumber() {

    const counterRef =
        doc(
            db,
            "counters",
            "certificate"
        );

    return await runTransaction(
        db,
        async (transaction) => {

            const counterSnap =
                await transaction.get(
                    counterRef
                );

            let nextNumber = 1;

            if (counterSnap.exists()) {

                nextNumber =
                    (counterSnap.data().number || 0) + 1;

            }

            transaction.set(
                counterRef,
                {
                    number: nextNumber
                },
                {
                    merge: true
                }
            );

            return (
                "GP/" +
                new Date().getFullYear() +
                "/" +
                String(nextNumber).padStart(6, "0")
            );

        }
    );
}


// ========================================
// APPLICATION NUMBER
// ========================================

export async function getNextApplicationNumber() {

    const counterRef =
        doc(
            db,
            "counters",
            "application"
        );

    return await runTransaction(
        db,
        async (transaction) => {

            const counterSnap =
                await transaction.get(
                    counterRef
                );

            let nextNumber = 1;

            if (counterSnap.exists()) {

                nextNumber =
                    (counterSnap.data().number || 0) + 1;

            }

            transaction.set(
                counterRef,
                {
                    number: nextNumber
                },
                {
                    merge: true
                }
            );

            return (
                "GPCP/" +
                new Date().getFullYear() +
                "/" +
                String(nextNumber).padStart(6, "0")
            );

        }
    );
}
