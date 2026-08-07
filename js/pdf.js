window.downloadPDF = async function () {

    const { jsPDF } = window.jspdf;

    const certificate = document.querySelector(".certificate");

    const canvas = await html2canvas(certificate, {
        scale: 2
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = 210;
    const pageHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pageWidth,
        pageHeight
    );


    // Signature Add
    const signature = new Image();

    signature.src = "assets/signature.png";


    signature.onload = function(){

        pdf.addImage(
            signature,
            "PNG",
            150,
            230,
            40,
            20
        );


        pdf.save(
            `${data.certificateNo}-${data.name}.pdf`
            .replace(/\s+/g,"-")
        );

    };

};
