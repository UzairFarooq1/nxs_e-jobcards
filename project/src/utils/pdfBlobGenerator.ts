import { JobCard } from '../contexts/JobCardContext';

/**
 * Generates a PDF Blob from job card data for email attachment
 */
export const generateJobCardPDFBlob = async (jobCard: JobCard): Promise<Blob> => {
  const htmlContent = generateHTMLContent(jobCard);
  
  // Create a temporary iframe to render the HTML
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';
  iframe.style.width = '210mm'; // A4 width
  iframe.style.height = '297mm'; // A4 height
  iframe.style.border = 'none';
  
  document.body.appendChild(iframe);
  
  return new Promise((resolve, reject) => {
    iframe.onload = async () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          throw new Error('Could not access iframe document');
        }
        
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();
        
        // Wait for images to load
        await waitForImages(iframeDoc);
        
        // Import and use html2canvas
        const html2canvas = (await import('html2canvas')).default;
        
        // Use html2canvas to convert to canvas, then to PDF
        const canvas = await html2canvas(iframeDoc.body, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          width: 794, // A4 width in pixels at 96 DPI
          height: 1123 // A4 height in pixels at 96 DPI
        });
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          document.body.removeChild(iframe);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate PDF blob'));
          }
        }, 'application/pdf');
      } catch (error) {
        document.body.removeChild(iframe);
        reject(error);
      }
    };
    
    iframe.src = 'about:blank';
  });
};

/**
 * Wait for all images in the document to load
 */
const waitForImages = (doc: Document): Promise<void> => {
  const images = Array.from(doc.querySelectorAll('img'));
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
 * Generate HTML content for the job card
 */
const generateHTMLContent = (jobCard: JobCard): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Job Card ${jobCard.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
          width: 210mm;
          min-height: 297mm;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .company-info {
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
          font-size: 18px;
          color: #6b7280;
        }
        .job-id {
          font-size: 16px;
          color: #2563eb;
          font-weight: bold;
          margin-top: 10px;
        }
        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #1f2937;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .field-group {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-bottom: 15px;
        }
        .field {
          margin-bottom: 10px;
        }
        .field-label {
          font-weight: bold;
          color: #374151;
          font-size: 14px;
          margin-bottom: 3px;
        }
        .field-value {
          color: #1f2937;
          font-size: 14px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 2px;
          min-height: 20px;
        }
        .text-area {
          min-height: 60px;
          white-space: pre-wrap;
        }
        .signature-section {
          margin-top: 30px;
          border: 1px solid #d1d5db;
          padding: 15px;
          border-radius: 5px;
        }
        .signature-img {
          max-width: 200px;
          height: 60px;
          border: 1px solid #d1d5db;
          border-radius: 3px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
          padding-top: 15px;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
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

      <div class="section">
        <div class="section-title">Facility Information</div>
        <div class="field-group">
          <div class="field">
            <div class="field-label">Hospital/Facility Name:</div>
            <div class="field-value">${jobCard.hospitalName}</div>
          </div>
          <div class="field">
            <div class="field-label">Date & Time:</div>
            <div class="field-value">${new Date(jobCard.dateTime).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Machine Details</div>
        <div class="field-group">
          <div class="field">
            <div class="field-label">Machine Type:</div>
            <div class="field-value">${jobCard.machineType}</div>
          </div>
          <div class="field">
            <div class="field-label">Machine Model:</div>
            <div class="field-value">${jobCard.machineModel}</div>
          </div>
          <div class="field">
            <div class="field-label">Serial Number:</div>
            <div class="field-value">${jobCard.serialNumber}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Service Details</div>
        <div class="field">
          <div class="field-label">Problem Reported:</div>
          <div class="field-value text-area">${jobCard.problemReported}</div>
        </div>
        <div class="field">
          <div class="field-label">Service Performed:</div>
          <div class="field-value text-area">${jobCard.servicePerformed}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Engineer Information</div>
        <div class="field-group">
          <div class="field">
            <div class="field-label">Engineer Name:</div>
            <div class="field-value">${jobCard.engineerName}</div>
          </div>
          <div class="field">
            <div class="field-label">Engineer ID:</div>
            <div class="field-value">${jobCard.engineerId}</div>
          </div>
        </div>
      </div>

      <div class="signature-section">
        <div class="field-label">Facility Representative Signature:</div>
        ${jobCard.facilitySignature ? 
          `<img src="${jobCard.facilitySignature}" alt="Signature" class="signature-img" />` : 
          '<div class="field-value">No signature available</div>'
        }
      </div>

      ${jobCard.beforeServiceImages && jobCard.beforeServiceImages.length > 0 ? `
        <div class="section">
          <div class="section-title">Service Documentation</div>
          <div class="field">
            <div class="field-label">Before Service Photos:</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
              ${jobCard.beforeServiceImages.map(img => 
                `<img src="${img}" alt="Before Service" style="max-width: 100%; height: 150px; object-fit: cover; border: 1px solid #d1d5db; border-radius: 5px;" />`
              ).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      ${jobCard.afterServiceImages && jobCard.afterServiceImages.length > 0 ? `
        <div class="section">
          <div class="field">
            <div class="field-label">After Service Photos:</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
              ${jobCard.afterServiceImages.map(img => 
                `<img src="${img}" alt="After Service" style="max-width: 100%; height: 150px; object-fit: cover; border: 1px solid #d1d5db; border-radius: 5px;" />`
              ).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      ${jobCard.facilityStampImage ? `
        <div class="section">
          <div class="field">
            <div class="field-label">Facility Stamp:</div>
            <div style="margin-top: 10px;">
              <img src="${jobCard.facilityStampImage}" alt="Facility Stamp" style="max-width: 200px; height: 100px; object-fit: contain; border: 1px solid #d1d5db; border-radius: 5px;" />
            </div>
          </div>
        </div>
      ` : ''}

      <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString()} | E-JobCard System</p>
        <p>This is an electronically generated document</p>
      </div>
    </body>
    </html>
  `;
};

// We need to add html2canvas to the project
// For now, let's create a simple fallback that generates a text-based PDF
export const generateSimplePDFBlob = async (jobCard: JobCard): Promise<Blob> => {
  const textContent = `
E-JobCard System

Job Card ID: ${jobCard.id}

FACILITY INFORMATION
Hospital/Facility Name: ${jobCard.hospitalName}
Date & Time: ${new Date(jobCard.dateTime).toLocaleString()}

MACHINE DETAILS
Machine Type: ${jobCard.machineType}
Machine Model: ${jobCard.machineModel}
Serial Number: ${jobCard.serialNumber}

SERVICE DETAILS
Problem Reported: ${jobCard.problemReported}

Service Performed: ${jobCard.servicePerformed}

ENGINEER INFORMATION
Engineer Name: ${jobCard.engineerName}
Engineer ID: ${jobCard.engineerId}

Generated on ${new Date().toLocaleDateString()}
E-JobCard System
  `.trim();

  return new Blob([textContent], { type: 'text/plain' });
};
