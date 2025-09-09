import React, { useState } from "react";
import { generateReliableJobCardPDF } from "../utils/reliablePdfGenerator";
import { JobCard } from "../contexts/JobCardContext";

export function ReliablePDFTest() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [testResult, setTestResult] = useState("");

  const testPDFGeneration = async () => {
    setIsGenerating(true);
    setTestResult("Generating reliable PDF...");

    try {
      // Create a test job card
      const testJobCard: JobCard = {
        id: "NXS-RELIABLE-TEST",
        hospitalName: "Test Hospital",
        facilitySignature: "",
        machineType: "Test X-Ray Machine",
        machineModel: "Test Model 123",
        serialNumber: "TEST-SERIAL-123",
        problemReported:
          "Test problem reported for reliable PDF generation testing",
        servicePerformed:
          "Test service performed for reliable PDF generation testing",
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
      const pdfBlob = await generateReliableJobCardPDF(testJobCard);

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reliable-test-jobcard-${testJobCard.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setTestResult(
        `✅ Reliable PDF generated successfully! Size: ${pdfBlob.size} bytes`
      );
    } catch (error) {
      console.error("PDF generation error:", error);
      setTestResult(`❌ PDF generation failed: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
      <h3 className="text-lg font-semibold mb-4 text-purple-800">
        Reliable PDF Generation Test
      </h3>
      <p className="text-sm text-purple-600 mb-4">
        Test the reliable PDF generator that should create viewable PDFs.
      </p>

      <div className="space-y-4">
        <button
          onClick={testPDFGeneration}
          disabled={isGenerating}
          className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Test Reliable PDF Generation"}
        </button>

        {testResult && (
          <div className="p-3 bg-white rounded border">
            <p className="text-sm">{testResult}</p>
          </div>
        )}

        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This uses a different PDF generation method.
            <br />
            <strong>Expected:</strong> The PDF should open correctly and be
            viewable.
            <br />
            <strong>Method:</strong> Uses window.print() with proper PDF
            formatting.
          </p>
        </div>
      </div>
    </div>
  );
}
