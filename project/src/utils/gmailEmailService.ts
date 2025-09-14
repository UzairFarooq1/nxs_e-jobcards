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

    // Quick health check - don't fail if backend is temporarily down
    console.log(`🔍 Testing backend health at: ${API_BASE_URL}/health`);
    try {
      const healthResponse = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log(`✅ Backend health check passed:`, healthData);
      } else {
        console.warn(`⚠️ Backend health check returned: ${healthResponse.status} - proceeding anyway`);
      }
    } catch (healthError) {
      console.warn(`⚠️ Backend health check failed:`, healthError.message, '- proceeding anyway');
    }

    // Generate beautiful HTML email template
    const htmlContent = generateJobCardEmailHTML(jobCard);
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('jobCardData', JSON.stringify(jobCard));
    formData.append('htmlContent', htmlContent);
    formData.append('pdf', pdfBlob, `jobcard-${jobCard.id}.pdf`);

    // Send request to backend with timeout
    console.log(`📤 Sending email request to: ${API_BASE_URL}/send-jobcard-email`);
    console.log(`📤 FormData contents:`, {
      jobCardData: formData.get('jobCardData') ? 'Present' : 'Missing',
      htmlContent: formData.get('htmlContent') ? 'Present' : 'Missing',
      pdf: formData.get('pdf') ? `Present (${formData.get('pdf').size} bytes)` : 'Missing'
    });
    
    const response = await fetch(`${API_BASE_URL}/send-jobcard-email`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(30000) // 30 second timeout
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
    console.log('🔄 Gmail SMTP failed - trying fallback mailto method...');
    
    // Try fallback mailto method
    try {
      const { sendJobCardEmail: fallbackSendEmail } = await import('./emailService');
      const success = await fallbackSendEmail(jobCard, pdfBlob);
      
      if (success) {
        console.log('✅ Fallback email method succeeded');
        return true;
      } else {
        console.log('❌ Fallback email method also failed');
        return false;
      }
    } catch (fallbackError) {
      console.error('❌ Fallback email method error:', fallbackError);
      return false;
    }
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
