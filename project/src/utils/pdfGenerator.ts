import { JobCard } from '../contexts/JobCardContext';

export function generateJobCardPDF(jobCard: JobCard) {
  // Create a new window with the job card content
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
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
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 5px;
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
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
          <img src="/logomain.png" alt="NXS Logo" style="height: 50px; max-width: 200px;" />
        </div>
        <div class="job-card-title">E-JobCard System</div>
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

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
}