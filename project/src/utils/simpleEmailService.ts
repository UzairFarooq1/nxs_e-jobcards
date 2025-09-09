import { JobCard } from '../contexts/JobCardContext';

export interface EmailNotificationData {
  jobCardId: string;
  hospitalName: string;
  machineType: string;
  machineModel: string;
  serialNumber: string;
  problemReported: string;
  servicePerformed: string;
  engineerName: string;
  engineerId: string;
  dateTime: string;
  adminEmail: string;
  hasImages: boolean;
  imageCount: number;
}

export function generateJobCardEmailContent(data: EmailNotificationData): { subject: string; body: string } {
  const subject = `New Job Card Created - ${data.jobCardId} - ${data.hospitalName}`;
  
  const body = `
NEW JOB CARD CREATED

Job Card Details:
================
Job Card ID: ${data.jobCardId}
Hospital/Facility: ${data.hospitalName}
Machine Type: ${data.machineType}
Machine Model: ${data.machineModel}
Serial Number: ${data.serialNumber}

Engineer Information:
====================
Engineer Name: ${data.engineerName}
Engineer ID: ${data.engineerId}
Service Date: ${new Date(data.dateTime).toLocaleDateString()}
Service Time: ${new Date(data.dateTime).toLocaleTimeString()}

Service Details:
===============
Problem Reported:
${data.problemReported}

Service Performed:
${data.servicePerformed}

Documentation:
==============
${data.hasImages ? `✓ Service photos captured (${data.imageCount} images)` : 'No service photos'}
✓ Facility signature captured
✓ Job card PDF generated

Next Steps:
===========
1. Log into the NXS E-JobCard system
2. View the complete job card details
3. Download the PDF for your records
4. Review service documentation and photos

System: NXS E-JobCard System
Generated: ${new Date().toLocaleString()}
  `.trim();

  return { subject, body };
}

export function createEmailNotification(jobCard: JobCard): void {
  const adminEmail = 'it@vanguard-group.org';
  
  const emailData: EmailNotificationData = {
    jobCardId: jobCard.id,
    hospitalName: jobCard.hospitalName,
    machineType: jobCard.machineType,
    machineModel: jobCard.machineModel,
    serialNumber: jobCard.serialNumber,
    problemReported: jobCard.problemReported,
    servicePerformed: jobCard.servicePerformed,
    engineerName: jobCard.engineerName,
    engineerId: jobCard.engineerId,
    dateTime: jobCard.dateTime,
    adminEmail,
    hasImages: !!(jobCard.beforeServiceImages?.length || jobCard.afterServiceImages?.length || jobCard.facilityStampImage),
    imageCount: (jobCard.beforeServiceImages?.length || 0) + (jobCard.afterServiceImages?.length || 0) + (jobCard.facilityStampImage ? 1 : 0)
  };

  const { subject, body } = generateJobCardEmailContent(emailData);
  
  // Create mailto link
  const mailtoLink = `mailto:${adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  // Open email client
  window.open(mailtoLink, '_blank');
  
  // Also copy to clipboard as backup
  if (navigator.clipboard) {
    navigator.clipboard.writeText(`To: ${adminEmail}\nSubject: ${subject}\n\n${body}`);
  }
  
  console.log('Email notification prepared for:', adminEmail);
  console.log('Job Card ID:', jobCard.id);
}

// Alternative: Show notification with email content that can be copied
export function showEmailNotification(jobCard: JobCard): void {
  const adminEmail = 'it@vanguard-group.org';
  
  const emailData: EmailNotificationData = {
    jobCardId: jobCard.id,
    hospitalName: jobCard.hospitalName,
    machineType: jobCard.machineType,
    machineModel: jobCard.machineModel,
    serialNumber: jobCard.serialNumber,
    problemReported: jobCard.problemReported,
    servicePerformed: jobCard.servicePerformed,
    engineerName: jobCard.engineerName,
    engineerId: jobCard.engineerId,
    dateTime: jobCard.dateTime,
    adminEmail,
    hasImages: !!(jobCard.beforeServiceImages?.length || jobCard.afterServiceImages?.length || jobCard.facilityStampImage),
    imageCount: (jobCard.beforeServiceImages?.length || 0) + (jobCard.afterServiceImages?.length || 0) + (jobCard.facilityStampImage ? 1 : 0)
  };

  const { subject, body } = generateJobCardEmailContent(emailData);
  
  // Show notification with email details
  const emailContent = `To: ${adminEmail}\nSubject: ${subject}\n\n${body}`;
  
  alert(`Job Card Created Successfully!\n\nEmail notification prepared for admin.\n\nEmail Details:\n${emailContent}`);
}

