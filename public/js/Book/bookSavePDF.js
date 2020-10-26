// DOM Elements
const savePDFButton = document.querySelector('.bookConfirm_header_print_btn');
console.log(savePDFButton);
console.log(document.body);
// Event Listener
savePDFButton.addEventListener('click', (event) => {
    downloadAsPDF();
});

// Util Functions
function downloadAsPDF() {
    const targetInvoice = document.querySelector('.saveASPDF');
    let opt = {
        margin: 1,
        filename: 'hotelfinderinvoice.pdf',
        image: {type: 'jpg', quality: 0.98},
        html2canvas: {scale: 2},
        jsPDF: {unit: 'in', format: 'letter', orientation: 'portrait'}
    };
    
    html2pdf().from(targetInvoice).set(opt).save();
    console.log(window);
}
