import { JobCard } from "../contexts/JobCardContext";
import { API_CONFIG } from "../config/api";

// Get API base URL based on current environment
const API_BASE_URL = API_CONFIG.getBaseUrl();

/**
 * Send job card email via Gmail SMTP backend
 */
export const sendJobCardEmail = async (jobCard: JobCard, pdfBlob: Blob): Promise<boolean> => {
  try {
    console.log(`📧 Sending job card email via Gmail SMTP for: ${jobCard.id}`);
    console.log(`📄 PDF size: ${pdfBlob.size} bytes`);

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('jobCardData', JSON.stringify(jobCard));
    formData.append('pdf', pdfBlob, `jobcard-${jobCard.id}.pdf`);

    // Send request to backend
    const response = await fetch(`${API_BASE_URL}/send-jobcard-email`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Email sent successfully:', result.messageId);
    return true;

  } catch (error) {
    console.error('❌ Error sending email via Gmail SMTP:', error);
    return false;
  }
};

/**
 * Test Gmail SMTP connection
 */
export const testGmailConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    
    console.log('🔍 Gmail SMTP status:', data);
    return data.smtp === 'connected';
  } catch (error) {
    console.error('❌ Error testing Gmail connection:', error);
    return false;
  }
};

/**
 * Generate PDF content for email attachment
 */
export const generateJobCardPDF = async (jobCard: JobCard): Promise<Blob> => {
  // Use the html2canvas PDF generator
  const { generateJobCardPDFBlob } = await import('./pdfBlobGenerator');
  return await generateJobCardPDFBlob(jobCard);
};
