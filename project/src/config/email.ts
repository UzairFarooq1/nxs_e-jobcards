// Email Configuration
export const EMAIL_CONFIG = {
  // Admin email address
  ADMIN_EMAIL: import.meta.env.VITE_ADMIN_EMAIL || "it@vanguard-group.org",
  
  // Primary email method: Gmail SMTP via backend
  // Fallback: mailto client
};

// Email templates
export const EMAIL_TEMPLATES = {
  JOB_CARD_NOTIFICATION: {
    subject: (jobCardId: string, hospitalName: string) => 
      `New Job Card: ${jobCardId} - ${hospitalName}`,
    
    body: (jobCard: any) => `
A new job card has been created:

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

Note: The complete job card PDF is available in the admin dashboard.
    `.trim()
  }
};
