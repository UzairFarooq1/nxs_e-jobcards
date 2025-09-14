import { JobCard } from "../contexts/JobCardContext";
import { EMAIL_CONFIG, EMAIL_TEMPLATES } from "../config/email";

/**
 * Fallback email service - opens mailto client
 * This is only used when Gmail SMTP fails
 */
export const sendJobCardEmail = async (jobCard: JobCard, pdfBlob: Blob): Promise<boolean> => {
  try {
    console.log("📧 Fallback: Opening email client for job card:", jobCard.id);
    return await sendViaMailto(jobCard, pdfBlob);
  } catch (error) {
    console.error("❌ Fallback email service error:", error);
    return false;
  }
};


/**
 * Send email using browser's mailto (development fallback)
 */
const sendViaMailto = async (jobCard: JobCard, pdfBlob: Blob): Promise<boolean> => {
  try {
    const subject = EMAIL_TEMPLATES.JOB_CARD_NOTIFICATION.subject(jobCard.id, jobCard.hospitalName);
    const body = EMAIL_TEMPLATES.JOB_CARD_NOTIFICATION.body(jobCard);

    const mailtoUrl = `mailto:${EMAIL_CONFIG.ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client
    window.open(mailtoUrl, '_blank');
    
    console.log("Email client opened with job card details");
    return true;
  } catch (error) {
    console.error("Error opening email client:", error);
    return false;
  }
};
