import { JobCard } from '../contexts/JobCardContext';

/**
 * Reliable PDF Generator using jsPDF
 * This creates a proper multi-page PDF that can be viewed and attached to emails
 */
export const generateReliableJobCardPDF = async (jobCard: JobCard): Promise<Blob> => {
  try {
    // Try the visual PDF generation first
    const visualPdf = await generateVisualPDF(jobCard);
    
    // Check if the PDF is too large (> 5MB)
    if (visualPdf.size > 5 * 1024 * 1024) {
      console.warn('PDF too large, falling back to text-based PDF');
      return await generateTextBasedPDF(jobCard);
    }
    
    return visualPdf;
    
  } catch (error) {
    console.error('Error generating visual PDF, falling back to text-based PDF:', error);
    return await generateTextBasedPDF(jobCard);
  }
};

/**
 * Generate visual PDF using jsPDF with proper multi-page support
 */
async function generateVisualPDF(jobCard: JobCard): Promise<Blob> {
  // Use jsPDF to create a proper multi-page PDF
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Page dimensions
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = margin;
  
  // Helper function to add text with word wrapping
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
    pdf.setFontSize(fontSize);
    if (isBold) {
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setFont('helvetica', 'normal');
    }
    
    const lines = pdf.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.4;
    
    // Check if we need a new page
    if (currentY + (lines.length * lineHeight) > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
    }
    
    pdf.text(lines, margin, currentY);
    currentY += lines.length * lineHeight + 5;
  };
  
  // Helper function to add a new page if needed
  const checkNewPage = (requiredHeight: number) => {
    if (currentY + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
    }
  };
  
  // Helper function to add images
  const addImage = async (imageData: string, width: number, height: number, caption?: string) => {
    checkNewPage(height + 20);
    
    // Scale image to fit content width if too large
    let imageWidth = width;
    let imageHeight = height;
    if (width > contentWidth) {
      imageWidth = contentWidth;
      imageHeight = (height * contentWidth) / width;
    }
    
    pdf.addImage(imageData, 'JPEG', margin, currentY, imageWidth, imageHeight);
    currentY += imageHeight + 10;
    
    if (caption) {
      addText(caption, 10);
    }
  };
  
  try {
    // Header
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Nairobi X-ray Supplies Limited', margin, currentY);
    currentY += 10;
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('E-JobCard System', margin, currentY);
    currentY += 15;
    
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Job Card ID: ${jobCard.id}`, margin, currentY);
    currentY += 20;
    
    // Job Details
    addText('JOB DETAILS', 16, true);
    addText(`Hospital/Facility: ${jobCard.hospitalName}`, 12);
    addText(`Engineer: ${jobCard.engineerName} (${jobCard.engineerId})`, 12);
    addText(`Date: ${new Date(jobCard.dateTime).toLocaleString()}`, 12);
    currentY += 10;
    
    // Machine Details
    addText('MACHINE DETAILS', 16, true);
    addText(`Type: ${jobCard.machineType}`, 12);
    addText(`Model: ${jobCard.machineModel}`, 12);
    addText(`Serial Number: ${jobCard.serialNumber}`, 12);
    currentY += 10;
    
    // Problem Reported
    addText('PROBLEM REPORTED', 16, true);
    addText(jobCard.problemReported, 12);
    currentY += 10;
    
    // Service Performed
    addText('SERVICE PERFORMED', 16, true);
    addText(jobCard.servicePerformed, 12);
    currentY += 15;
    
    // Before Service Photos
    if (jobCard.beforeServiceImages && jobCard.beforeServiceImages.length > 0) {
      addText('BEFORE SERVICE PHOTOS', 16, true);
      
      for (let i = 0; i < jobCard.beforeServiceImages.length; i++) {
        const imageData = jobCard.beforeServiceImages[i];
        await addImage(imageData, 150, 100, `Before Service Photo ${i + 1}`);
      }
    }
    
    // After Service Photos
    if (jobCard.afterServiceImages && jobCard.afterServiceImages.length > 0) {
      addText('AFTER SERVICE PHOTOS', 16, true);
      
      for (let i = 0; i < jobCard.afterServiceImages.length; i++) {
        const imageData = jobCard.afterServiceImages[i];
        await addImage(imageData, 150, 100, `After Service Photo ${i + 1}`);
      }
    }
    
    // Facility Stamp
    if (jobCard.facilityStampImage) {
      addText('FACILITY STAMP', 16, true);
      await addImage(jobCard.facilityStampImage, 200, 100, 'Official Facility Stamp');
    }
    
    // Signatures Section
    addText('SIGNATURES', 16, true);
    
    // Engineer Signature
    if (jobCard.engineerSignature) {
      addText('Engineer Signature:', 12, true);
      await addImage(jobCard.engineerSignature, 150, 60, `${jobCard.engineerName} (${jobCard.engineerId})`);
    } else {
      addText('Engineer Signature: [Not Available]', 12);
    }
    
    // Facility Representative Signature
    if (jobCard.facilitySignature) {
      addText('Facility Representative Signature:', 12, true);
      await addImage(jobCard.facilitySignature, 150, 60, 'Authorized Facility Representative');
    } else {
      addText('Facility Representative Signature: [Not Available]', 12);
    }
    
    // Footer
    checkNewPage(30);
    addText('Generated by NXS E-JobCard System', 10);
    addText(`Generated on: ${new Date().toLocaleString()}`, 10);
    addText('Nairobi X-ray Supplies Ltd | Professional Medical Equipment Services', 10);
    
    // Generate PDF blob
    return pdf.output('blob');
    
  } catch (error) {
    console.error('Error generating visual PDF:', error);
    throw error;
  }
}

/**
 * Generate a simple text-based PDF content as fallback using jsPDF
 */
async function generateTextBasedPDF(jobCard: JobCard): Promise<Blob> {
  try {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set font
    pdf.setFont('helvetica');
    
    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Nairobi X-ray Supplies Limited', 20, 20);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('E-JobCard System', 20, 30);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Job Card ID: ${jobCard.id}`, 20, 40);
    
    // Job Details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Job Details:', 20, 55);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Hospital: ${jobCard.hospitalName}`, 20, 65);
    pdf.text(`Engineer: ${jobCard.engineerName} (${jobCard.engineerId})`, 20, 70);
    pdf.text(`Date: ${new Date(jobCard.dateTime).toLocaleString()}`, 20, 75);
    
    // Machine Details
    pdf.setFont('helvetica', 'bold');
    pdf.text('Machine Details:', 20, 85);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Type: ${jobCard.machineType}`, 20, 95);
    pdf.text(`Model: ${jobCard.machineModel}`, 20, 100);
    pdf.text(`Serial Number: ${jobCard.serialNumber}`, 20, 105);
    
    // Problem Reported
    pdf.setFont('helvetica', 'bold');
    pdf.text('Problem Reported:', 20, 115);
    pdf.setFont('helvetica', 'normal');
    const problemLines = pdf.splitTextToSize(jobCard.problemReported, 170);
    pdf.text(problemLines, 20, 120);
    
    // Service Performed
    const serviceY = 120 + (problemLines.length * 5) + 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Service Performed:', 20, serviceY);
    pdf.setFont('helvetica', 'normal');
    const serviceLines = pdf.splitTextToSize(jobCard.servicePerformed, 170);
    pdf.text(serviceLines, 20, serviceY + 10);
    
    // Footer
    const footerY = serviceY + 10 + (serviceLines.length * 5) + 20;
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, footerY);
    pdf.text('Nairobi X-ray Supplies Ltd', 105, footerY, { align: 'center' });
    
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating text-based PDF:', error);
    // Ultimate fallback - create a simple text blob
    const textContent = `
NXS E-JobCard System
Job Card ID: ${jobCard.id}
Hospital: ${jobCard.hospitalName}
Engineer: ${jobCard.engineerName} (${jobCard.engineerId})
Machine: ${jobCard.machineType} - ${jobCard.machineModel}
Serial Number: ${jobCard.serialNumber}
Date: ${new Date(jobCard.dateTime).toLocaleString()}

Problem Reported:
${jobCard.problemReported}

Service Performed:
${jobCard.servicePerformed}

Generated: ${new Date().toLocaleString()}
Nairobi X-ray Supplies Ltd
    `.trim();
    
    return new Blob([textContent], { type: 'text/plain' });
  }
}