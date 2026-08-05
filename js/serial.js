import { db, doc, runTransaction } from "./firebase.js";

export async function getNextCertificateNumber() {

  const serialRef = doc(db, "settings", "serial");

  const nextNumber = await runTransaction(db, async (transaction) => {

    const serialDoc = await transaction.get(serialRef);

    if (!serialDoc.exists()) {
      throw new Error("Serial document not found.");
    }

    const currentCounter = serialDoc.data().counter;
    const newCounter = currentCounter + 1;

    transaction.update(serialRef, {
      counter: newCounter
    });

    return newCounter;
  });

  const year = new Date().getFullYear();

  return `GP/LKP/${year}/${String(nextNumber).padStart(6, "0")}`;
}
