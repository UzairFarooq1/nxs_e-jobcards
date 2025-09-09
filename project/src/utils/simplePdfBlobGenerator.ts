import { JobCard } from '../contexts/JobCardContext';

/**
 * Simple PDF Blob Generator using html2canvas
 * More reliable for email attachments
 */
export const generateSimpleJobCardPDFBlob = async (jobCard: JobCard): Promise<Blob> => {
  try {
    // Dynamically import html2canvas
    const html2canvas = (await import('html2canvas')).default;
    
    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '210mm';
    container.style.height = '297mm';
    container.style.backgroundColor = 'white';
    container.style.padding = '20px';
    container.style.fontFamily = 'Arial, sans-serif';
    
    // Generate HTML content
    container.innerHTML = generateSimpleHTMLContent(jobCard);
    
    document.body.appendChild(container);
    
    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
    });
    
    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        document.body.removeChild(container);
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate PDF blob'));
        }
      }, 'application/pdf', 0.95);
    });
    
  } catch (error) {
    console.error('Error generating PDF blob:', error);
    throw error;
  }
};

/**
 * Generate simple HTML content for PDF
 */
function generateSimpleHTMLContent(jobCard: JobCard): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Job Card ${jobCard.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .logo {
          height: 60px;
          margin-bottom: 10px;
        }
        .job-card-title {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 5px;
        }
        .job-id {
          font-size: 18px;
          color: #666;
        }
        .content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .section {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
        }
        .section h3 {
          margin: 0 0 10px 0;
          color: #2563eb;
          font-size: 16px;
        }
        .field {
          margin-bottom: 8px;
        }
        .field-label {
          font-weight: bold;
          color: #555;
        }
        .field-value {
          color: #333;
          margin-left: 10px;
        }
        .full-width {
          grid-column: 1 / -1;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="/static/images/logomain.png" alt="NXS Logo" class="logo" />
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

        <div class="section full-width">
          <h3>Problem Reported</h3>
          <p>${jobCard.problemReported}</p>
        </div>

        <div class="section full-width">
          <h3>Service Performed</h3>
          <p>${jobCard.servicePerformed}</p>
        </div>
      </div>

      <div class="footer">
        <p>Generated by NXS E-JobCard System - ${new Date().toLocaleString()}</p>
        <p>Nairobi X-ray Supplies Ltd</p>
      </div>
    </body>
    </html>
  `;
}
