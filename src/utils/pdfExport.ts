import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportElementToPdf(
  elementId: string,
  filename: string,
  orientation: 'p' | 'l' = 'p',
  format: 'a4' | 'a5' = 'a4'
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    // Make sure all fonts and images are ready
    const canvas = await html2canvas(element, {
      scale: 2.5, // Crisp rendering
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculate dimensions maintaining aspect ratio
    const imgWidth = pageWidth - 16; // 8mm margin each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pageHeight - 16) {
      // Single page fits
      const xOffset = 8;
      const yOffset = (pageHeight - imgHeight) / 2 > 8 ? 8 : 8;
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
    } else {
      // Multi-page or scale to fit
      let heightLeft = imgHeight;
      let position = 8;
      pdf.addImage(imgData, 'PNG', 8, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 16;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 8;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 8, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }

    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback: trigger print dialog if canvas fails
    window.print();
    return false;
  }
}
