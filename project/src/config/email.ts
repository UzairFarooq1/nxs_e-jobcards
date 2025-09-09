// Email Configuration
export const EMAIL_CONFIG = {
  // Admin email address
  ADMIN_EMAIL: import.meta.env.VITE_ADMIN_EMAIL || "it@vanguard-group.org",
  
  // Email service settings
  USE_EMAIL_SERVICE: true, // Now using EmailJS
  
  // EmailJS configuration (if using EmailJS)
  EMAILJS: {
    SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_3zya3on",
    TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_ur5rvkh",
    PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "JMhuvm_lxCrEhXP_I"
  },
  
  // Custom email API endpoint (if using custom API)
  EMAIL_API: {
    ENDPOINT: import.meta.env.VITE_EMAIL_API_ENDPOINT || "https://your-api.com/send-email",
    API_KEY: import.meta.env.VITE_EMAIL_API_KEY || "your_api_key"
  }
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
