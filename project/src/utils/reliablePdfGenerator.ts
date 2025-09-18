import { JobCard } from '../contexts/JobCardContext';

/**
 * Reliable PDF Generator using html2canvas and jsPDF
 * This creates a proper PDF that can be viewed and attached to emails
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
 * Generate visual PDF using html2canvas and jsPDF
 */
async function generateVisualPDF(jobCard: JobCard): Promise<Blob> {
  // Create a temporary container for PDF generation
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '-9999px';
  tempContainer.style.width = '210mm'; // A4 width
  tempContainer.style.height = '297mm'; // A4 height
  tempContainer.style.background = 'white';
  tempContainer.style.padding = '20px';
  tempContainer.style.boxSizing = 'border-box';
  
  // Generate HTML content
  const htmlContent = generatePDFHTMLContent(jobCard);
  tempContainer.innerHTML = htmlContent;
  
  // Add to DOM temporarily
  document.body.appendChild(tempContainer);
  
  try {
    // Wait for images to load
    await waitForImages(tempContainer);
    
    // Use html2canvas to convert to canvas
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(tempContainer, {
      scale: 1.5, // Reduced scale for smaller file size
      useCORS: true,
      allowTaint: true,
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      backgroundColor: '#ffffff'
    });
    
    // Use jsPDF to create a proper PDF
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Convert canvas to image data with compression
    const imgData = canvas.toDataURL('image/jpeg', 0.8); // JPEG with 80% quality
    
    // Add image to PDF
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    
    // Clean up
    document.body.removeChild(tempContainer);
    
    // Generate PDF blob
    return pdf.output('blob');
    
  } catch (error) {
    // Clean up
    document.body.removeChild(tempContainer);
    throw error;
  }
}

/**
 * Wait for all images in the container to load
 */
const waitForImages = (container: HTMLElement): Promise<void> => {
  const images = Array.from(container.querySelectorAll('img'));
  const imagePromises = images.map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Continue even if image fails to load
    });
  });
  
  return Promise.all(imagePromises).then(() => {});
};

/**
 * Generate HTML content for PDF printing
 */
function generatePDFHTMLContent(jobCard: JobCard): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Job Card ${jobCard.id}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          background: white;
          color: #333;
          line-height: 1.6;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
        }
        
        .company-info {
          text-align: center;
          margin-bottom: 15px;
        }
        
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 5px;
        }
        
        .company-subtitle {
          font-size: 16px;
          color: #666;
          font-weight: 500;
        }
        
        .job-card-title {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 8px;
        }
        
        .job-id {
          font-size: 20px;
          color: #666;
          font-weight: 500;
        }
        
        .content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          margin-bottom: 30px;
        }
        
        .section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          border-left: 5px solid #2563eb;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .section h3 {
          margin: 0 0 15px 0;
          color: #2563eb;
          font-size: 18px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .field {
          margin-bottom: 12px;
          display: flex;
          align-items: flex-start;
        }
        
        .field-label {
          font-weight: bold;
          color: #555;
          min-width: 120px;
          margin-right: 10px;
        }
        
        .field-value {
          color: #333;
          flex: 1;
        }
        
        .full-width {
          grid-column: 1 / -1;
        }
        
        .problem-section, .service-section {
          background: #fff;
          border: 2px solid #e5e7eb;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
        }
        
        .problem-section h3, .service-section h3 {
          color: #dc2626;
          border-bottom: 2px solid #dc2626;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        
        .service-section h3 {
          color: #059669;
          border-bottom: 2px solid #059669;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        
        .signature-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
        
        .signature-box {
          text-align: center;
          padding: 20px;
          border: 2px dashed #ccc;
          border-radius: 8px;
        }
        
        .signature-line {
          border-bottom: 1px solid #333;
          margin: 20px 0 10px 0;
          height: 40px;
        }
        
        .photos-section {
          margin: 20px 0;
          page-break-inside: avoid;
        }
        
        .photos-section h3 {
          color: #2563eb;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        
        .photos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        
        .photo-item {
          text-align: center;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 10px;
          background: #f9fafb;
        }
        
        .service-photo {
          max-width: 100%;
          max-height: 150px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid #d1d5db;
        }
        
        .photo-caption {
          margin-top: 8px;
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }
        
        .stamp-section {
          margin: 20px 0;
          page-break-inside: avoid;
        }
        
        .stamp-section h3 {
          color: #7c3aed;
          border-bottom: 2px solid #7c3aed;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        
        .stamp-container {
          text-align: center;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 20px;
          background: #f9fafb;
        }
        
        .facility-stamp {
          max-width: 200px;
          max-height: 100px;
          object-fit: contain;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
        }
        
        .stamp-caption {
          margin-top: 10px;
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <div class="company-name">Nairobi X-ray Supplies Limited</div>
          <div class="company-subtitle">E-JobCard System</div>
        </div>
        <div class="job-id">Job Card ID: ${jobCard.id}</div>
      </div>

      <div class="content">
        <div class="section">
          <h3>Job Details</h3>
          <div class="field">
            <span class="field-label">Hospital:</span>
            <span class="field-value">${jobCard.hospitalName}</span>
          </div>
          <div class="field">
            <span class="field-label">Engineer:</span>
            <span class="field-value">${jobCard.engineerName} (${jobCard.engineerId})</span>
          </div>
          <div class="field">
            <span class="field-label">Date:</span>
            <span class="field-value">${new Date(jobCard.dateTime).toLocaleString()}</span>
          </div>
        </div>

        <div class="section">
          <h3>Machine Details</h3>
          <div class="field">
            <span class="field-label">Type:</span>
            <span class="field-value">${jobCard.machineType}</span>
          </div>
          <div class="field">
            <span class="field-label">Model:</span>
            <span class="field-value">${jobCard.machineModel}</span>
          </div>
          <div class="field">
            <span class="field-label">Serial Number:</span>
            <span class="field-value">${jobCard.serialNumber}</span>
          </div>
        </div>
      </div>

      <div class="problem-section">
        <h3>Problem Reported</h3>
        <p>${jobCard.problemReported}</p>
      </div>

      <div class="service-section">
        <h3>Service Performed</h3>
        <p>${jobCard.servicePerformed}</p>
      </div>

      ${jobCard.beforeServiceImages && jobCard.beforeServiceImages.length > 0 ? `
        <div class="photos-section">
          <h3>Before Service Photos</h3>
          <div class="photos-grid">
            ${jobCard.beforeServiceImages.map((img, index) => 
              `<div class="photo-item">
                <img src="${img}" alt="Before Service Photo ${index + 1}" class="service-photo" />
                <p class="photo-caption">Before Service Photo ${index + 1}</p>
              </div>`
            ).join('')}
          </div>
        </div>
      ` : ''}

      ${jobCard.afterServiceImages && jobCard.afterServiceImages.length > 0 ? `
        <div class="photos-section">
          <h3>After Service Photos</h3>
          <div class="photos-grid">
            ${jobCard.afterServiceImages.map((img, index) => 
              `<div class="photo-item">
                <img src="${img}" alt="After Service Photo ${index + 1}" class="service-photo" />
                <p class="photo-caption">After Service Photo ${index + 1}</p>
              </div>`
            ).join('')}
          </div>
        </div>
      ` : ''}

      ${jobCard.facilityStampImage ? `
        <div class="stamp-section">
          <h3>Facility Stamp</h3>
          <div class="stamp-container">
            <img src="${jobCard.facilityStampImage}" alt="Facility Stamp" class="facility-stamp" />
            <p class="stamp-caption">Official Facility Stamp</p>
          </div>
        </div>
      ` : ''}

      <div class="signature-section">
        <div class="signature-box">
          <h4>Engineer Signature</h4>
          ${jobCard.engineerSignature ? 
            `<img src="${jobCard.engineerSignature}" alt="Engineer Signature" style="max-width: 100%; max-height: 80px; border: 1px solid #ddd; border-radius: 4px;" />` :
            '<div class="signature-line"></div>'
          }
          <p>${jobCard.engineerName} (${jobCard.engineerId})</p>
        </div>
        <div class="signature-box">
          <h4>Facility Representative Signature</h4>
          ${jobCard.facilitySignature ? 
            `<img src="${jobCard.facilitySignature}" alt="Facility Signature" style="max-width: 100%; max-height: 80px; border: 1px solid #ddd; border-radius: 4px;" />` :
            '<div class="signature-line"></div>'
          }
          <p>Authorized Facility Representative</p>
        </div>
      </div>

      <div class="footer">
        <p><strong>Generated by NXS E-JobCard System</strong> - ${new Date().toLocaleString()}</p>
        <p>Nairobi X-ray Supplies Ltd | Professional Medical Equipment Services</p>
      </div>
    </body>
    </html>
  `;
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
    
    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Nairobi X-ray Supplies Limited', 105, 20, { align: 'center' });
    
    // Subtitle
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('E-JobCard System', 105, 30, { align: 'center' });
    
    // Job Card ID
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Job Card ID: ${jobCard.id}`, 20, 35);
    
    // Hospital
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Hospital: ${jobCard.hospitalName}`, 20, 50);
    
    // Engineer
    pdf.text(`Engineer: ${jobCard.engineerName} (${jobCard.engineerId})`, 20, 60);
    
    // Machine details
    pdf.text(`Machine: ${jobCard.machineType} - ${jobCard.machineModel}`, 20, 70);
    pdf.text(`Serial Number: ${jobCard.serialNumber}`, 20, 80);
    pdf.text(`Date: ${new Date(jobCard.dateTime).toLocaleString()}`, 20, 90);
    
    // Problem Reported
    pdf.setFont('helvetica', 'bold');
    pdf.text('Problem Reported:', 20, 110);
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
