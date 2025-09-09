import { JobCard } from '../contexts/JobCardContext';

/**
 * Generate beautiful HTML email template for job card notifications
 */
export const generateJobCardEmailHTML = (jobCard: JobCard): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Job Card - ${jobCard.id}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        
        .logo {
          height: 60px;
          margin-bottom: 15px;
          filter: brightness(0) invert(1);
        }
        
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        
        .content {
          padding: 30px 20px;
        }
        
        .job-card-info {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 2px solid #0ea5e9;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 25px;
          text-align: center;
        }
        
        .job-id {
          font-size: 24px;
          font-weight: 700;
          color: #0c4a6e;
          margin-bottom: 10px;
          letter-spacing: 1px;
        }
        
        .job-status {
          display: inline-block;
          background: #059669;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 25px;
        }
        
        .detail-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          transition: transform 0.2s ease;
        }
        
        .detail-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .detail-card h3 {
          margin: 0 0 15px 0;
          color: #1e40af;
          font-size: 16px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 8px;
        }
        
        .detail-item {
          margin-bottom: 12px;
          display: flex;
          align-items: flex-start;
        }
        
        .detail-label {
          font-weight: 600;
          color: #475569;
          min-width: 100px;
          margin-right: 10px;
          font-size: 14px;
        }
        
        .detail-value {
          color: #1e293b;
          flex: 1;
          font-size: 14px;
        }
        
        .problem-section, .service-section {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 25px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .problem-section h3 {
          color: #dc2626;
          border-bottom: 3px solid #dc2626;
          padding-bottom: 10px;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: 600;
        }
        
        .service-section h3 {
          color: #059669;
          border-bottom: 3px solid #059669;
          padding-bottom: 10px;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: 600;
        }
        
        .problem-content, .service-content {
          background: #fef2f2;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #dc2626;
          font-size: 15px;
          line-height: 1.6;
        }
        
        .service-content {
          background: #f0fdf4;
          border-left-color: #059669;
        }
        
        .attachments-section {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        }
        
        .attachments-section h3 {
          margin: 0 0 15px 0;
          color: #1e40af;
          font-size: 16px;
          font-weight: 600;
        }
        
        .attachment-item {
          display: flex;
          align-items: center;
          padding: 10px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          margin-bottom: 8px;
        }
        
        .attachment-icon {
          width: 20px;
          height: 20px;
          margin-right: 10px;
          color: #dc2626;
        }
        
        .footer {
          background: #1e293b;
          color: #94a3b8;
          padding: 25px 20px;
          text-align: center;
          border-radius: 0 0 8px 8px;
        }
        
        .footer h4 {
          color: #ffffff;
          margin: 0 0 10px 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .footer p {
          margin: 5px 0;
          font-size: 14px;
        }
        
        .footer .company-name {
          color: #3b82f6;
          font-weight: 600;
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
          margin: 20px 0;
        }
        
        @media (max-width: 600px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
          
          .email-container {
            margin: 0;
            border-radius: 0;
          }
          
          .header, .content, .footer {
            padding: 20px 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="/static/images/logomain.png" alt="NXS Logo" class="logo" />
          <h1>New Job Card Submitted</h1>
          <p>E-JobCard System Notification</p>
        </div>
        
        <div class="content">
          <div class="job-card-info">
            <div class="job-id">${jobCard.id}</div>
            <div class="job-status">${jobCard.status}</div>
          </div>
          
          <div class="details-grid">
            <div class="detail-card">
              <h3>Job Details</h3>
              <div class="detail-item">
                <span class="detail-label">Hospital:</span>
                <span class="detail-value">${jobCard.hospitalName}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Engineer:</span>
                <span class="detail-value">${jobCard.engineerName}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">ID:</span>
                <span class="detail-value">${jobCard.engineerId}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${new Date(jobCard.dateTime).toLocaleString()}</span>
              </div>
            </div>
            
            <div class="detail-card">
              <h3>Machine Details</h3>
              <div class="detail-item">
                <span class="detail-label">Type:</span>
                <span class="detail-value">${jobCard.machineType}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Model:</span>
                <span class="detail-value">${jobCard.machineModel}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Serial No:</span>
                <span class="detail-value">${jobCard.serialNumber}</span>
              </div>
            </div>
          </div>
          
          <div class="problem-section">
            <h3>🚨 Problem Reported</h3>
            <div class="problem-content">
              ${jobCard.problemReported}
            </div>
          </div>
          
          <div class="service-section">
            <h3>🔧 Service Performed</h3>
            <div class="service-content">
              ${jobCard.servicePerformed}
            </div>
          </div>
          
          <div class="attachments-section">
            <h3>📎 Attachments</h3>
            <div class="attachment-item">
              <span class="attachment-icon">📄</span>
              <span>Job Card PDF Document</span>
            </div>
            ${jobCard.beforeServiceImages.length > 0 ? `
              <div class="attachment-item">
                <span class="attachment-icon">📷</span>
                <span>Before Service Photos (${jobCard.beforeServiceImages.length})</span>
              </div>
            ` : ''}
            ${jobCard.afterServiceImages.length > 0 ? `
              <div class="attachment-item">
                <span class="attachment-icon">📷</span>
                <span>After Service Photos (${jobCard.afterServiceImages.length})</span>
              </div>
            ` : ''}
            ${jobCard.facilityStampImage ? `
              <div class="attachment-item">
                <span class="attachment-icon">🏢</span>
                <span>Facility Stamp Image</span>
              </div>
            ` : ''}
          </div>
          
          <div class="divider"></div>
          
          <div style="text-align: center; margin: 20px 0;">
            <p style="color: #64748b; font-size: 14px;">
              This job card was automatically generated by the NXS E-JobCard System.
              <br>
              Please review the attached PDF document for complete details.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <h4>NXS E-JobCard System</h4>
          <p class="company-name">Nairobi X-ray Supplies Ltd</p>
          <p>Professional Medical Equipment Services</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
