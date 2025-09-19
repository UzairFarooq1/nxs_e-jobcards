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
    
    // Service Photos Section - Side by Side
    if ((jobCard.beforeServiceImages && jobCard.beforeServiceImages.length > 0) || 
        (jobCard.afterServiceImages && jobCard.afterServiceImages.length > 0)) {
      addText('SERVICE PHOTOS', 16, true);
      
      // Calculate the maximum number of photo pairs
      const maxBeforePhotos = jobCard.beforeServiceImages ? jobCard.beforeServiceImages.length : 0;
      const maxAfterPhotos = jobCard.afterServiceImages ? jobCard.afterServiceImages.length : 0;
      const maxPhotoPairs = Math.max(maxBeforePhotos, maxAfterPhotos);
      
      for (let i = 0; i < maxPhotoPairs; i++) {
        checkNewPage(120); // Reserve space for side-by-side photos
        
        // Before Service Photo (Left side)
        if (jobCard.beforeServiceImages && jobCard.beforeServiceImages[i]) {
          const beforeImageData = jobCard.beforeServiceImages[i];
          const imageWidth = (contentWidth - 10) / 2; // Half width minus gap
          const imageHeight = 80;
          
          pdf.addImage(beforeImageData, 'JPEG', margin, currentY, imageWidth, imageHeight);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Before Service ${i + 1}`, margin, currentY + imageHeight + 5);
        }
        
        // After Service Photo (Right side)
        if (jobCard.afterServiceImages && jobCard.afterServiceImages[i]) {
          const afterImageData = jobCard.afterServiceImages[i];
          const imageWidth = (contentWidth - 10) / 2; // Half width minus gap
          const imageHeight = 80;
          const rightX = margin + (contentWidth - 10) / 2 + 10; // Right side position
          
          pdf.addImage(afterImageData, 'JPEG', rightX, currentY, imageWidth, imageHeight);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`After Service ${i + 1}`, rightX, currentY + imageHeight + 5);
        }
        
        currentY += 100; // Move down for next pair
      }
    }
    
    // Signatures and Stamp Section - Side by Side
    addText('SIGNATURES & STAMP', 16, true);
    checkNewPage(100); // Reserve space for signatures and stamp
    
    // Left side - Signatures
    const leftX = margin;
    const rightX = margin + (contentWidth - 10) / 2 + 10;
    const signatureHeight = 60;
    
    // Engineer Signature (Left side)
    if (jobCard.engineerSignature) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Engineer Signature:', leftX, currentY);
      pdf.addImage(jobCard.engineerSignature, 'JPEG', leftX, currentY + 5, (contentWidth - 10) / 2, signatureHeight);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${jobCard.engineerName} (${jobCard.engineerId})`, leftX, currentY + signatureHeight + 10);
    } else {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Engineer Signature: [Not Available]', leftX, currentY);
    }
    
    // Facility Representative Signature (Left side, below engineer)
    if (jobCard.facilitySignature) {
      const facilitySignatureY = currentY + signatureHeight + 25;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Facility Representative:', leftX, facilitySignatureY);
      pdf.addImage(jobCard.facilitySignature, 'JPEG', leftX, facilitySignatureY + 5, (contentWidth - 10) / 2, signatureHeight);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Authorized Facility Representative', leftX, facilitySignatureY + signatureHeight + 10);
    } else {
      const facilitySignatureY = currentY + signatureHeight + 25;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Facility Representative: [Not Available]', leftX, facilitySignatureY);
    }
    
    // Right side - Facility Stamp
    if (jobCard.facilityStampImage) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Facility Stamp:', rightX, currentY);
      pdf.addImage(jobCard.facilityStampImage, 'JPEG', rightX, currentY + 5, (contentWidth - 10) / 2, signatureHeight);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Official Facility Stamp', rightX, currentY + signatureHeight + 10);
    } else {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Facility Stamp: [Not Available]', rightX, currentY);
    }
    
    // Move currentY down to account for the side-by-side layout
    currentY += signatureHeight + 80;
    
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