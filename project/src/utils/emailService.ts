import { JobCard } from "../contexts/JobCardContext";
import { EMAIL_CONFIG, EMAIL_TEMPLATES } from "../config/email";

// Import EmailJS (you'll need to install: npm install @emailjs/browser)
// For now, we'll use a dynamic import to avoid build errors

/**
 * Sends job card PDF via email to admin
 */
export const sendJobCardEmail = async (jobCard: JobCard, pdfBlob: Blob): Promise<boolean> => {
  try {
    console.log("Sending job card email for:", jobCard.id);

    if (EMAIL_CONFIG.USE_EMAIL_SERVICE) {
      // Method 1: Using EmailJS or similar service
      return await sendViaEmailService(jobCard, pdfBlob);
    } else {
      // Method 2: Using browser's mailto (for development)
      return await sendViaMailto(jobCard, pdfBlob);
    }
  } catch (error) {
    console.error("Error sending job card email:", error);
    return false;
  }
};

/**
 * Send email using EmailJS (legacy - now using Gmail SMTP)
 */
const sendViaEmailService = async (jobCard: JobCard, pdfBlob: Blob): Promise<boolean> => {
  try {
    // Dynamically import EmailJS
    const emailjs = await import('@emailjs/browser');
    
    // Initialize EmailJS with your public key
    emailjs.init(EMAIL_CONFIG.EMAILJS.PUBLIC_KEY);
    
    // Convert PDF blob to base64 for attachment
    const base64Pdf = await blobToBase64(pdfBlob);
    
    // Prepare template parameters for EmailJS
    const templateParams = {
      to_email: EMAIL_CONFIG.ADMIN_EMAIL, // Send TO admin's email
      from_name: "NXS E-JobCard System", // Sender name
      reply_to: EMAIL_CONFIG.ADMIN_EMAIL, // Reply to admin's email
      subject: EMAIL_TEMPLATES.JOB_CARD_NOTIFICATION.subject(jobCard.id, jobCard.hospitalName),
      message: EMAIL_TEMPLATES.JOB_CARD_NOTIFICATION.body(jobCard),
      job_card_id: jobCard.id,
      hospital_name: jobCard.hospitalName,
      engineer_name: jobCard.engineerName,
      engineer_id: jobCard.engineerId,
      machine_type: jobCard.machineType,
      machine_model: jobCard.machineModel,
      serial_number: jobCard.serialNumber,
      problem_reported: jobCard.problemReported,
      service_performed: jobCard.servicePerformed,
      date_time: new Date(jobCard.dateTime).toLocaleString(),
      // PDF attachment as base64
      pdf_attachment: base64Pdf,
      pdf_filename: `jobcard-${jobCard.id}.pdf`,
      // Additional fields for better template support
      pdf_data: base64Pdf,
      attachment_name: `jobcard-${jobCard.id}.pdf`,
      attachment_data: base64Pdf
    };

    console.log("Sending email via EmailJS...");
    console.log("PDF size:", pdfBlob.size, "bytes");
    console.log("Base64 length:", base64Pdf.length);
    
    // Send email using EmailJS send method with PDF attachment
    const response = await emailjs.send(
      EMAIL_CONFIG.EMAILJS.SERVICE_ID,
      EMAIL_CONFIG.EMAILJS.TEMPLATE_ID,
      templateParams,
      EMAIL_CONFIG.EMAILJS.PUBLIC_KEY
    );

    console.log("Email sent successfully:", response);
    return true;
  } catch (error) {
    console.error("Error sending email via EmailJS:", error);
    console.log("Falling back to mailto method...");
    return await sendViaMailto(jobCard, pdfBlob);
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

/**
 * Convert blob to base64 string
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:application/pdf;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Generate PDF content for email attachment
 */
export const generateJobCardPDF = async (jobCard: JobCard): Promise<Blob> => {
  // Use the html2canvas PDF generator
  const { generateJobCardPDFBlob } = await import('./pdfBlobGenerator');
  return await generateJobCardPDFBlob(jobCard);
};