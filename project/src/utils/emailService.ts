import { JobCard } from "../contexts/JobCardContext";
import { EMAIL_CONFIG, EMAIL_TEMPLATES } from "../config/email";
import { supabase } from "../config/supabase";

/**
 * Primary email service using EmailJS with SMTP port 465
 * Sends emails through it@vanguard-group.org to both admin and engineer
 */
export const sendJobCardEmail = async (jobCard: JobCard, pdfBlob: Blob): Promise<boolean> => {
  try {
    console.log("📧 Sending job card email for:", jobCard.id);
    console.log("📧 To Admin:", EMAIL_CONFIG.ADMIN_EMAIL);

    // Get engineer's email from database
    const engineerEmail = await getEngineerEmail(jobCard.engineerId);
    console.log("📧 To Engineer:", engineerEmail);

    if (EMAIL_CONFIG.USE_BACKEND_EMAIL) {
      // Method 1: Using backend Gmail SMTP - send to both admin and engineer
      return await sendViaBackendService(jobCard, pdfBlob, engineerEmail);
    } else if (EMAIL_CONFIG.USE_EMAIL_SERVICE) {
      // Method 2: Using EmailJS (currently blocked)
      return await sendViaEmailService(jobCard, pdfBlob, engineerEmail);
    } else {
      // Method 3: Using browser's mailto (for development)
      return await sendViaMailto(jobCard, pdfBlob, engineerEmail);
    }
  } catch (error) {
    console.error("❌ Error sending job card email:", error);
    return false;
  }
};

/**
 * Get engineer's email from database using engineer ID
 */
const getEngineerEmail = async (engineerId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from("engineers")
      .select("email")
      .eq("engineer_id", engineerId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching engineer email:", error);
      return null;
    }

    return data?.email || null;
  } catch (error) {
    console.error("Error fetching engineer email:", error);
    return null;
  }
};

/**
 * Send email using backend Gmail SMTP service
 */
const sendViaBackendService = async (jobCard: JobCard, pdfBlob: Blob, engineerEmail: string | null): Promise<boolean> => {
  try {
    console.log("📧 Sending email via backend Gmail SMTP...");
    console.log("📧 Backend URL:", EMAIL_CONFIG.BACKEND_API_URL);
    console.log("📧 PDF size:", pdfBlob.size, "bytes");

    // Note: PDF is sent as blob in FormData, not as base64

    // Prepare job card data for backend. Backend will send to multiple recipients in TO field.
    const jobCardData = {
      id: jobCard.id,
      hospitalName: jobCard.hospitalName,
      facilitySignature: jobCard.facilitySignature,
      engineerSignature: jobCard.engineerSignature,
      machineType: jobCard.machineType,
      machineModel: jobCard.machineModel,
      serialNumber: jobCard.serialNumber,
      problemReported: jobCard.problemReported,
      servicePerformed: jobCard.servicePerformed,
      engineerName: jobCard.engineerName,
      engineerId: jobCard.engineerId,
      dateTime: jobCard.dateTime,
      engineerEmail: engineerEmail,
      beforeServiceImages: jobCard.beforeServiceImages || [],
      afterServiceImages: jobCard.afterServiceImages || [],
      facilityStampImage: jobCard.facilityStampImage || ""
    };

    console.log("📧 Frontend sending job card data:", {
      engineerName: jobCardData.engineerName,
      engineerId: jobCardData.engineerId,
      engineerEmail: jobCardData.engineerEmail
    });

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('jobCardData', JSON.stringify(jobCardData));
    formData.append('pdf', pdfBlob, `jobcard-${jobCard.id}.pdf`);

    // Send to backend API
    const response = await fetch(`${EMAIL_CONFIG.BACKEND_API_URL}/api/send-jobcard-email`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Backend email service failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("✅ Email sent successfully via backend:", result);
    console.log("📧 Backend response recipients:", result.recipients);
    return true;
  } catch (error) {
    console.error("❌ Error sending email via backend:", error);
    console.log("🔄 Falling back to mailto method...");
    return await sendViaMailto(jobCard, pdfBlob, engineerEmail);
  }
};

/**
 * Send email using EmailJS with SMTP port 465
 */
const sendViaEmailService = async (jobCard: JobCard, pdfBlob: Blob, engineerEmail: string | null): Promise<boolean> => {
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
      cc_email: engineerEmail || '', // CC engineer's email if available
      from_name: "NXS E-JobCard System", // Sender name
      from_email: EMAIL_CONFIG.EMAILJS.FROM_EMAIL, // From it@vanguard-group.org
      reply_to: EMAIL_CONFIG.EMAILJS.FROM_EMAIL, // Reply to it@vanguard-group.org
      subject: EMAIL_TEMPLATES.JOB_CARD_NOTIFICATION.subject(jobCard.id, jobCard.hospitalName),
      message: EMAIL_TEMPLATES.JOB_CARD_NOTIFICATION.body(jobCard),
      job_card_id: jobCard.id,
      hospital_name: jobCard.hospitalName,
      engineer_name: jobCard.engineerName,
      engineer_id: jobCard.engineerId,
      engineer_email: engineerEmail || 'Not available',
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
      attachment_data: base64Pdf,
      // SMTP settings
      smtp_port: EMAIL_CONFIG.EMAILJS.SMTP_PORT,
      smtp_host: EMAIL_CONFIG.EMAILJS.SMTP_HOST
    };

    console.log("📧 Sending email via EmailJS with SMTP port 465...");
    console.log("📧 PDF size:", pdfBlob.size, "bytes");
    console.log("📧 Base64 length:", base64Pdf.length);
    console.log("📧 SMTP Host:", EMAIL_CONFIG.EMAILJS.SMTP_HOST);
    console.log("📧 SMTP Port:", EMAIL_CONFIG.EMAILJS.SMTP_PORT);
    
    // Send email using EmailJS send method with PDF attachment
    const response = await emailjs.send(
      EMAIL_CONFIG.EMAILJS.SERVICE_ID,
      EMAIL_CONFIG.EMAILJS.TEMPLATE_ID,
      templateParams,
      EMAIL_CONFIG.EMAILJS.PUBLIC_KEY
    );

    console.log("✅ Email sent successfully via EmailJS:", response);
    return true;
  } catch (error) {
    console.error("❌ Error sending email via EmailJS:", error);
    console.log("🔄 Falling back to mailto method...");
    return await sendViaMailto(jobCard, pdfBlob, engineerEmail);
  }
};

/**
 * Send email using browser's mailto (development fallback)
 */
const sendViaMailto = async (jobCard: JobCard, _pdfBlob: Blob, engineerEmail: string | null): Promise<boolean> => {
  try {
    const subject = EMAIL_TEMPLATES.JOB_CARD_NOTIFICATION.subject(jobCard.id, jobCard.hospitalName);
    const body = EMAIL_TEMPLATES.JOB_CARD_NOTIFICATION.body(jobCard);

    // Include admin, engineer, and Gladys in recipients
    const recipients = engineerEmail 
      ? `${EMAIL_CONFIG.ADMIN_EMAIL},${engineerEmail},gladys.kariuki@nxsltd.com`
      : `${EMAIL_CONFIG.ADMIN_EMAIL},gladys.kariuki@nxsltd.com`;

    const mailtoUrl = `mailto:${recipients}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client
    window.open(mailtoUrl, '_blank');
    
    console.log("Email client opened with job card details");
    console.log("Recipients:", recipients);
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
  // Use the reliable PDF generator
  const { generateReliableJobCardPDF } = await import('./reliablePdfGenerator');
  return await generateReliableJobCardPDF(jobCard);
}

/**
 * Debug function to test engineer email lookup
 */
export const debugEngineerEmail = async (engineerId: string): Promise<void> => {
  console.log("🔧 DEBUG: Testing engineer email lookup for ID:", engineerId);

  try {
    // Test database connection
    const { error: testError } = await supabase.from("engineers").select("count").limit(1);

    if (testError) {
      console.error("❌ Database connection failed:", testError);
      return;
    }

    console.log("✅ Database connection successful");

    // Get all engineers
    const { data: allEngineers, error: allError } = await supabase.from("engineers").select("engineer_id, email, name");

    if (allError) {
      console.error("❌ Failed to fetch all engineers:", allError);
      return;
    }

    console.log("📊 All engineers in database:", allEngineers);

    // Test specific engineer lookup
    const engineerEmail = await getEngineerEmail(engineerId);
    console.log("🎯 Result for engineer ID", engineerId, ":", engineerEmail);
  } catch (error) {
    console.error("❌ Debug function failed:", error);
  }
};
