import { useState } from "react";
import { generateJobCardPDFBlob } from "../utils/pdfBlobGenerator";
import { JobCard } from "../contexts/JobCardContext";

export function PDFTest() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [testResult, setTestResult] = useState("");
  const [pdfInfo, setPdfInfo] = useState<{
    size: number;
    base64Length: number;
    downloadUrl: string;
  } | null>(null);

  const testPdfGeneration = async () => {
    setIsGenerating(true);
    setTestResult("Generating PDF...");

    try {
      // Create a test job card
      const testJobCard: JobCard = {
        id: "NXS-TEST-001",
        hospitalName: "Test Hospital",
        facilitySignature: "",
        machineType: "Test X-Ray Machine",
        machineModel: "Test Model 123",
        serialNumber: "TEST-SERIAL-123",
        problemReported: "Test problem reported for PDF testing",
        servicePerformed: "Test service performed for PDF testing",
        engineerName: "Test Engineer",
        engineerId: "ENG-TEST-001",
        dateTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: "completed",
        beforeServiceImages: [],
        afterServiceImages: [],
        facilityStampImage: "",
      };

      console.log("Generating PDF for test job card...");

      // Generate PDF
      const pdfBlob = await generateJobCardPDFBlob(testJobCard);
      console.log("PDF generated successfully, size:", pdfBlob.size, "bytes");

      // Convert to base64
      const base64Pdf = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data:application/pdf;base64, prefix
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.readAsDataURL(pdfBlob);
      });

      console.log("Base64 conversion completed, length:", base64Pdf.length);

      // Create download URL
      const downloadUrl = URL.createObjectURL(pdfBlob);

      setPdfInfo({
        size: pdfBlob.size,
        base64Length: base64Pdf.length,
        downloadUrl: downloadUrl,
      });

      setTestResult("✅ PDF generated successfully! Check the details below.");
    } catch (error) {
      console.error("PDF generation error:", error);
      setTestResult(`❌ PDF generation failed: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPdf = () => {
    if (pdfInfo) {
      const link = document.createElement("a");
      link.href = pdfInfo.downloadUrl;
      link.download = "test-jobcard.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
      <h3 className="text-lg font-semibold mb-4 text-green-800">
        PDF Generation Test
      </h3>
      <p className="text-sm text-green-600 mb-4">
        Test PDF generation and base64 conversion for email attachments.
      </p>

      <button
        onClick={testPdfGeneration}
        disabled={isGenerating}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 mb-4"
      >
        {isGenerating ? "Generating PDF..." : "Test PDF Generation"}
      </button>

      {testResult && (
        <div className="mb-4 p-3 bg-white rounded border">
          <p className="text-sm">{testResult}</p>
        </div>
      )}

      {pdfInfo && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded border">
            <h4 className="font-semibold text-gray-800 mb-2">
              PDF Information
            </h4>
            <div className="space-y-2 text-sm">
              <p>
                <strong>File Size:</strong> {pdfInfo.size.toLocaleString()}{" "}
                bytes
              </p>
              <p>
                <strong>Base64 Length:</strong>{" "}
                {pdfInfo.base64Length.toLocaleString()} characters
              </p>
              <p>
                <strong>Size in KB:</strong> {(pdfInfo.size / 1024).toFixed(2)}{" "}
                KB
              </p>
              <p>
                <strong>Size in MB:</strong>{" "}
                {(pdfInfo.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={downloadPdf}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              📄 Download Test PDF
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(pdfInfo.base64Length.toString());
                alert("Base64 length copied to clipboard!");
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              📋 Copy Base64 Length
            </button>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> If the PDF is too large (&gt; 10MB),
              EmailJS may not be able to send it. Consider using cloud storage
              for large files.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
