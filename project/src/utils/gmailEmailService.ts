import { JobCard } from "../contexts/JobCardContext";
import { API_CONFIG } from "../config/api";
import { generateJobCardEmailHTML } from "./emailTemplate";

// Get API base URL based on current environment
const API_BASE_URL = API_CONFIG.getBaseUrl();

/**
 * Send job card email via Gmail SMTP backend
 */
export const sendJobCardEmail = async (jobCard: JobCard, pdfBlob: Blob): Promise<boolean> => {
  try {
    console.log(`📧 Sending job card email via Gmail SMTP for: ${jobCard.id}`);
    console.log(`🌐 Using API URL: ${API_BASE_URL}`);
    console.log(`📄 PDF size: ${pdfBlob.size} bytes`);

    // First, test if backend is available
    console.log(`🔍 Testing backend health at: ${API_BASE_URL}/health`);
    try {
      const healthResponse = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!healthResponse.ok) {
        console.error(`❌ Backend health check failed: ${healthResponse.status} ${healthResponse.statusText}`);
        console.error(`❌ Response URL: ${healthResponse.url}`);
        const errorText = await healthResponse.text();
        console.error(`❌ Error response: ${errorText.substring(0, 200)}...`);
        throw new Error(`Backend not available: ${healthResponse.status}`);
      }
      
      const healthData = await healthResponse.json();
      console.log(`✅ Backend health check passed:`, healthData);
    } catch (healthError) {
      console.error(`❌ Backend health check failed:`, healthError);
      throw new Error(`Backend not reachable: ${healthError.message}`);
    }

    // Generate beautiful HTML email template
    const htmlContent = generateJobCardEmailHTML(jobCard);
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('jobCardData', JSON.stringify(jobCard));
    formData.append('htmlContent', htmlContent);
    formData.append('pdf', pdfBlob, `jobcard-${jobCard.id}.pdf`);

    // Send request to backend
    console.log(`📤 Sending email request to: ${API_BASE_URL}/send-jobcard-email`);
    const response = await fetch(`${API_BASE_URL}/send-jobcard-email`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error(`❌ Email request failed: ${response.status} ${response.statusText}`);
      console.error(`❌ Response URL: ${response.url}`);
      
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorText = await response.text();
        console.error(`❌ Error response body: ${errorText.substring(0, 500)}...`);
        
        // Try to parse as JSON first
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If not JSON, use the text directly (might be HTML error page)
          if (errorText.includes('<!DOCTYPE')) {
            errorMessage = `Server returned HTML error page (${response.status})`;
          } else {
            errorMessage = errorText.substring(0, 100);
          }
        }
      } catch (parseError) {
        console.error(`❌ Could not parse error response:`, parseError);
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Email sent successfully:', result.messageId);
    return true;

  } catch (error) {
    console.error('❌ Error sending email via Gmail SMTP:', error);
    
    // Try fallback email service
    console.log('🔄 Attempting fallback email service...');
    try {
      const { sendJobCardEmail: fallbackSendEmail } = await import('./emailService');
      const success = await fallbackSendEmail(jobCard, pdfBlob);
      
      if (success) {
        console.log('✅ Fallback email service succeeded');
        return true;
      } else {
        console.log('❌ Fallback email service also failed');
      }
    } catch (fallbackError) {
      console.error('❌ Fallback email service error:', fallbackError);
    }
    
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
  // Use the reliable PDF generator
  const { generateReliableJobCardPDF } = await import('./reliablePdfGenerator');
  return await generateReliableJobCardPDF(jobCard);
};
