import React, { useState } from "react";
import {
  sendJobCardEmail,
  generateJobCardPDF,
} from "../utils/gmailEmailService";
import { JobCard } from "../contexts/JobCardContext";

export function EmailTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState("");

  const testEmail = async () => {
    setIsTesting(true);
    setTestResult("Testing email functionality...");

    try {
      // Create a test job card
      const testJobCard: JobCard = {
        id: "NXS-TEST-001",
        hospitalName: "Test Hospital",
        facilitySignature: "",
        machineType: "Test X-Ray Machine",
        machineModel: "Test Model 123",
        serialNumber: "TEST-SERIAL-123",
        problemReported: "Test problem reported for email testing",
        servicePerformed: "Test service performed for email testing",
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
        setTestResult("✅ Email test successful! Check your admin email.");
      } else {
        setTestResult("❌ Email test failed. Check console for details.");
      }
    } catch (error) {
      console.error("Email test error:", error);
      setTestResult(`❌ Email test error: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Email Test</h3>
      <p className="text-sm text-gray-600 mb-4">
        Test the email functionality with a sample job card.
      </p>

      <button
        onClick={testEmail}
        disabled={isTesting}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isTesting ? "Testing..." : "Test Email"}
      </button>

      {testResult && (
        <div className="mt-4 p-3 bg-white rounded border">
          <p className="text-sm">{testResult}</p>
        </div>
      )}
    </div>
  );
}
