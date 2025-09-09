import React, { useState } from "react";
import { generateSimpleJobCardPDFBlob } from "../utils/simplePdfBlobGenerator";
import { JobCard } from "../contexts/JobCardContext";

export function PDFTestSimple() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [testResult, setTestResult] = useState("");

  const testPDFGeneration = async () => {
    setIsGenerating(true);
    setTestResult("Generating test PDF...");

    try {
      // Create a test job card
      const testJobCard: JobCard = {
        id: "NXS-TEST-PDF",
        hospitalName: "Test Hospital",
        facilitySignature: "",
        machineType: "Test X-Ray Machine",
        machineModel: "Test Model 123",
        serialNumber: "TEST-SERIAL-123",
        problemReported: "Test problem reported for PDF generation testing",
        servicePerformed: "Test service performed for PDF generation testing",
        engineerName: "Test Engineer",
        engineerId: "ENG-TEST-001",
        dateTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: "completed",
        beforeServiceImages: [],
        afterServiceImages: [],
        facilityStampImage: "",
      };

      // Generate PDF blob
      const pdfBlob = await generateSimpleJobCardPDFBlob(testJobCard);

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `test-jobcard-${testJobCard.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setTestResult(
        `✅ PDF generated successfully! Size: ${pdfBlob.size} bytes`
      );
    } catch (error) {
      console.error("PDF generation error:", error);
      setTestResult(`❌ PDF generation failed: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
      <h3 className="text-lg font-semibold mb-4 text-green-800">
        Simple PDF Generation Test
      </h3>
      <p className="text-sm text-green-600 mb-4">
        Test the simplified PDF generator for email attachments.
      </p>

      <div className="space-y-4">
        <button
          onClick={testPDFGeneration}
          disabled={isGenerating}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Test PDF Generation"}
        </button>

        {testResult && (
          <div className="p-3 bg-white rounded border">
            <p className="text-sm">{testResult}</p>
          </div>
        )}

        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This will generate and download a test PDF.
            <br />
            <strong>Check:</strong> The PDF should open correctly and contain
            the logo.
          </p>
        </div>
      </div>
    </div>
  );
}
