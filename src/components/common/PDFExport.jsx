import React from 'react'
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PDFExport = () => {
    const pdfExportComponent = useRef(null);
  
    const downloadPDF = async () => {
      try {
        if (pdfExportComponent.current) {
          const pdfElement = pdfExportComponent.current;
          const canvas = await html2canvas(pdfElement);
          const imgData = canvas.toDataURL('image/png');
  
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
          const imgX = (pdfWidth - imgWidth * ratio) / 2;
          const imgY = 30; // Adjust this value as needed
  
          pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
          pdf.save("income.pdf");
        } else {
          console.error("PDF export component not found");
        }
      } catch (error) {
        console.error("Error exporting to PDF:", error);
      }
    };
  
    return (
      <div>
        <div ref={pdfExportComponent}>
          {/* Your content to be exported as PDF */}
        </div>
        <button onClick={downloadPDF}>Download PDF</button>
      </div>
    );
  };

export default PDFExport