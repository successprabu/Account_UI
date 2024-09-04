import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

export const addInstructionPage = (pdf, instructionData) => {

  const reportDate = instructionData.date; // Assuming headerData.reportDate is in a format recognized by Date
  const formattedDate = format(new Date(reportDate), 'dd-MM-yyyy');

  // Set styles for instruction page
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 255); // Blue color for instruction text

  // Define the titles and values separately
  const titles = [
    'Function Name:',
    'Date:',
    'Celebration Gifts:',
    'Place:'
  ];

  const values = [
    instructionData.functionName,
    formattedDate,
    instructionData.celebrationGifts,
    instructionData.place
  ];

  // Set the margins and spacing
  const leftMargin = 40;
  const columnSpacing = 10; // Space between title and value columns
  const lineSpacing = 12; // Space between each row
  const initialY = 120; // Starting y position for the first text line
  const boxPadding = 2; // Padding inside the border box

  // Add the marriage-related icon above the text
  const iconPath = '/images/marriage.png';
  pdf.addImage(iconPath, 'PNG', (pdf.internal.pageSize.getWidth() - 20) / 2, 10, 20, 20); // Adjust icon size and position as needed

  // Add the text content with borders around each title-value pair
  titles.forEach((title, index) => {
    const value = values[index];
    const titleX = leftMargin;
    const valueX = titleX + 80; // Fixed space between title and value column
    const yPosition = initialY + (index * lineSpacing); // Calculate the y position for each line

    // Calculate the width and height for the border box
    const boxWidth = 150; // Set a fixed width for the border box
    const boxHeight = lineSpacing;

    // Draw the border around the title-value pair
    pdf.setDrawColor(0, 0, 0); // Black color for the border
    pdf.rect(leftMargin - boxPadding, yPosition - lineSpacing + boxPadding, boxWidth, boxHeight);

    // Add the title in regular font
    pdf.setFont("helvetica", "normal");
    pdf.text(title, titleX, yPosition);

    // Add the value in bold
    pdf.setFont("helvetica", "bold");
    pdf.text(value, valueX, yPosition);
  });

  // Add a border around the entire instruction page
  pdf.setDrawColor(0, 0, 0); // Black color for border
  pdf.rect(5, 5, pdf.internal.pageSize.getWidth() - 10, pdf.internal.pageSize.getHeight() - 10);
};
