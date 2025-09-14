// Email Configuration
export const EMAIL_CONFIG = {
  // Admin email address
  ADMIN_EMAIL: import.meta.env.VITE_ADMIN_EMAIL || "it@vanguard-group.org",
  
  // Primary email method: EmailJS with SMTP port 465
  USE_EMAIL_SERVICE: true,
  
  // EmailJS configuration for it@vanguard-group.org
  EMAILJS: {
    SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_3zya3on",
    TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_ur5rvkh", 
    PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "JMhuvm_lxCrEhXP_I",
    // SMTP settings for port 465
    SMTP_PORT: 465,
    SMTP_HOST: "smtp.gmail.com",
    FROM_EMAIL: "it@vanguard-group.org"
  },
  
  // Fallback: Gmail SMTP via backend
  // Final fallback: mailto client
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
