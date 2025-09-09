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
    console.log('🔍 Testing Gmail connection at:', `${API_BASE_URL}/health`);
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      console.error('❌ Health check failed:', response.status, response.statusText);
      return false;
    }
    
    const data = await response.json();
    console.log('🔍 Gmail SMTP status:', data);
    
    // Check if SMTP is configured (not connected, as that would require actual email sending)
    return data.smtp === 'configured';
  } catch (error) {
    console.error('❌ Error testing Gmail connection:', error);
    return false;
  }
};

/**
 * Generate PDF content for email attachment
 */
export const generateJobCardPDF = async (jobCard: JobCard): Promise<Blob> => {
  // Use the simple PDF generator for better reliability
  const { generateSimpleJobCardPDFBlob } = await import('./simplePdfBlobGenerator');
  return await generateSimpleJobCardPDFBlob(jobCard);
};
