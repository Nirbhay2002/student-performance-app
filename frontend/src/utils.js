import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const downloadPDF = (elementId, fileName) => {
    const input = document.getElementById(elementId);
    if (!input) return;

    // Temporarily remove animation/opacity to prevent "washed out" or transparent capture
    const originalAnimation = input.style.animation;
    const originalOpacity = input.style.opacity;
    const originalTransform = input.style.transform;
    const originalClass = input.className;

    input.style.animation = 'none';
    input.style.opacity = '1';
    input.style.transform = 'none';
    input.classList.remove('fade-in');

    html2canvas(input, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
        const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

        let heightLeft = imgHeight;
        let position = 0;

        // First page
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Subsequent pages if content overflows
        while (heightLeft > 0) {
            position -= pdfHeight; // Move image up by one page height
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(`${fileName}.pdf`);

        // Restore original styles
        input.style.animation = originalAnimation;
        input.style.opacity = originalOpacity;
        input.style.transform = originalTransform;
        input.className = originalClass;
    }).catch(err => {
        console.error("PDF Generation Error:", err);
        // Restore original styles in case of error
        input.style.animation = originalAnimation;
        input.style.opacity = originalOpacity;
        input.style.transform = originalTransform;
        input.className = originalClass;
    });
};

export const generatePdfBlob = (elementId) => {
    return new Promise((resolve, reject) => {
        const input = document.getElementById(elementId);
        if (!input) {
            reject(new Error(`Element with id ${elementId} not found`));
            return;
        }

        const originalAnimation = input.style.animation;
        const originalOpacity = input.style.opacity;
        const originalTransform = input.style.transform;
        const originalClass = input.className;

        input.style.animation = 'none';
        input.style.opacity = '1';
        input.style.transform = 'none';
        input.classList.remove('fade-in');

        html2canvas(input, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            const blob = pdf.output('blob');

            input.style.animation = originalAnimation;
            input.style.opacity = originalOpacity;
            input.style.transform = originalTransform;
            input.className = originalClass;

            resolve(blob);
        }).catch(err => {
            console.error("PDF Generation Error:", err);
            input.style.animation = originalAnimation;
            input.style.opacity = originalOpacity;
            input.style.transform = originalTransform;
            input.className = originalClass;
            reject(err);
        });
    });
};
