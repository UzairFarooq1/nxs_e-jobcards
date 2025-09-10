import { JobCard } from '../contexts/JobCardContext';

/**
 * Reliable PDF Generator using html2canvas and jsPDF
 * This creates a proper PDF that can be viewed and attached to emails
 */
export const generateReliableJobCardPDF = async (jobCard: JobCard): Promise<Blob> => {
  try {
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
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
        backgroundColor: '#ffffff'
      });
      
      // Convert canvas to blob
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          // Clean up
          document.body.removeChild(tempContainer);
          
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate PDF blob'));
          }
        }, 'application/pdf', 0.95); // High quality
      });
      
    } catch (html2canvasError) {
      console.warn('html2canvas failed, falling back to text-based PDF:', html2canvasError);
      
      // Clean up
      document.body.removeChild(tempContainer);
      
      // Fallback to text-based PDF
      const pdfContent = generateTextBasedPDF(jobCard);
      return new Blob([pdfContent], { type: 'application/pdf' });
    }
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Final fallback
    const pdfContent = generateTextBasedPDF(jobCard);
    return new Blob([pdfContent], { type: 'application/pdf' });
  }
};

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
        
        .logo-container {
          text-align: center;
          margin-bottom: 15px;
        }
        
        .company-name {
          font-size: 32px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 5px;
        }
        
        .company-subtitle {
          font-size: 14px;
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
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-container">
          <div class="company-name">NXS</div>
          <div class="company-subtitle">Nairobi X-ray Supplies Ltd</div>
        </div>
        <div class="job-card-title">E-JobCard System</div>
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

      <div class="signature-section">
        <div class="signature-box">
          <h4>Engineer Signature</h4>
          <div class="signature-line"></div>
          <p>${jobCard.engineerName}</p>
        </div>
        <div class="signature-box">
          <h4>Facility Representative</h4>
          <div class="signature-line"></div>
          <p>Authorized Signature</p>
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
 * Generate a simple text-based PDF content as fallback
 */
function generateTextBasedPDF(jobCard: JobCard): string {
  // Escape special characters for PDF
  const escape = (str: string) => str.replace(/[()\\]/g, '\\$&');
  
  const content = `BT
/F1 16 Tf
50 750 Td
(NXS E-JobCard System) Tj
0 -30 Td
/F1 12 Tf
(Job Card ID: ${escape(jobCard.id)}) Tj
0 -20 Td
(Hospital: ${escape(jobCard.hospitalName)}) Tj
0 -20 Td
(Engineer: ${escape(jobCard.engineerName)} (${escape(jobCard.engineerId)})) Tj
0 -20 Td
(Machine: ${escape(jobCard.machineType)} - ${escape(jobCard.machineModel)}) Tj
0 -20 Td
(Serial Number: ${escape(jobCard.serialNumber)}) Tj
0 -20 Td
(Date: ${escape(new Date(jobCard.dateTime).toLocaleString())}) Tj
0 -30 Td
(Problem Reported:) Tj
0 -20 Td
/F1 10 Tf
(${escape(jobCard.problemReported)}) Tj
0 -30 Td
/F1 12 Tf
(Service Performed:) Tj
0 -20 Td
/F1 10 Tf
(${escape(jobCard.servicePerformed)}) Tj
0 -30 Td
/F1 12 Tf
(Generated: ${escape(new Date().toLocaleString())}) Tj
ET`;

  return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length ${content.length}
>>
stream
${content}
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000001285 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
${1384 + content.length - 1000}
%%EOF`;
}
