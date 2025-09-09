import { useState } from "react";
import {
  testGmailConnection,
  sendJobCardEmail,
  generateJobCardPDF,
} from "../utils/gmailEmailService";
import { JobCard } from "../contexts/JobCardContext";

export function GmailSMTPTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<string>("");

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult("Testing Gmail SMTP connection...");

    try {
      const isConnected = await testGmailConnection();
      if (isConnected) {
        setConnectionStatus("✅ Connected");
        setTestResult(
          "Gmail SMTP connection successful! Backend is configured and ready."
        );
      } else {
        setConnectionStatus("❌ Disconnected");
        setTestResult(
          "Gmail SMTP connection failed. Check if backend is deployed and environment variables are set."
        );
      }
    } catch (error) {
      console.error("Connection test error:", error);
      setConnectionStatus("❌ Error");
      setTestResult(
        `Connection test failed: ${error}. Check if backend is running at the correct URL.`
      );
    } finally {
      setIsTesting(false);
    }
  };

  const testEmail = async () => {
    setIsTesting(true);
    setTestResult("Testing Gmail SMTP email sending...");

    try {
      // Create a test job card
      const testJobCard: JobCard = {
        id: "NXS-TEST-GMAIL",
        hospitalName: "Test Hospital",
        facilitySignature: "",
        machineType: "Test X-Ray Machine",
        machineModel: "Test Model 123",
        serialNumber: "TEST-SERIAL-123",
        problemReported: "Test problem reported for Gmail SMTP testing",
        servicePerformed: "Test service performed for Gmail SMTP testing",
        engineerName: "Test Engineer",
        engineerId: "ENG-TEST-001",
        dateTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: "completed",
        beforeServiceImages: [],
        afterServiceImages: [],
        facilityStampImage: "",
      };

      // Generate PDF
      const pdfBlob = await generateJobCardPDF(testJobCard);

      // Send email
      const emailSent = await sendJobCardEmail(testJobCard, pdfBlob);

      if (emailSent) {
        setTestResult(
          "✅ Gmail SMTP email test successful! Check your admin email."
        );
      } else {
        setTestResult(
          "❌ Gmail SMTP email test failed. Check console for details."
        );
      }
    } catch (error) {
      console.error("Email test error:", error);
      setTestResult(`❌ Gmail SMTP email test error: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold mb-4 text-blue-800">
        Gmail SMTP Test
      </h3>
      <p className="text-sm text-blue-600 mb-4">
        Test Gmail SMTP connection and email sending functionality.
      </p>

      <div className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center space-x-4">
          <button
            onClick={testConnection}
            disabled={isTesting}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isTesting ? "Testing..." : "Test Connection"}
          </button>

          {connectionStatus && (
            <span
              className={`text-sm font-medium ${
                connectionStatus.includes("✅")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {connectionStatus}
            </span>
          )}
        </div>

        {/* Email Test */}
        <div>
          <button
            onClick={testEmail}
            disabled={isTesting}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isTesting ? "Sending..." : "Test Email"}
          </button>
        </div>

        {/* Results */}
        {testResult && (
          <div className="p-3 bg-white rounded border">
            <p className="text-sm">{testResult}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Make sure the backend is deployed on Vercel.
            <br />
            <strong>Backend URL:</strong>{" "}
            https://nxs-e-jobcards-backend.vercel.app/api
            <br />
            <strong>Environment Variables:</strong> SMTP_HOST, SMTP_USER,
            SMTP_PASS, ADMIN_EMAIL
          </p>
        </div>
      </div>
    </div>
  );
}
