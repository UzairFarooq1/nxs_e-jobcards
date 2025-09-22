import React, { useState } from "react";
import {
  ArrowLeft,
  Save,
  FileSignature as Signature,
  Calendar,
  Building,
  Wrench,
  Camera,
  X,
  Upload,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useJobCard } from "../contexts/JobCardContext";
import { SignatureCanvas } from "./SignatureCanvas";
import { sendJobCardEmail, generateJobCardPDF } from "../utils/emailService";

interface JobCardFormProps {
  onBack: () => void;
}

export function JobCardForm({ onBack }: JobCardFormProps) {
  const { user } = useAuth();
  const { addJobCard, getAllJobCards } = useJobCard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState("");
  const [facilitySignature, setFacilitySignature] = useState("");
  const [engineerSignature, setEngineerSignature] = useState("");
  const [showFacilitySignature, setShowFacilitySignature] = useState(false);
  const [showEngineerSignature, setShowEngineerSignature] = useState(false);
  const [beforeServiceImages, setBeforeServiceImages] = useState<string[]>([]);
  const [afterServiceImages, setAfterServiceImages] = useState<string[]>([]);
  const [facilityStampImage, setFacilityStampImage] = useState<string>("");
  const [showFacilityDropdown, setShowFacilityDropdown] = useState(false);
  const [facilitySearchTerm, setFacilitySearchTerm] = useState("");

  // Manual job card upload states
  const [isManualUpload, setIsManualUpload] = useState(false);
  const [manualJobCard, setManualJobCard] = useState<File | null>(null);
  const [manualReason, setManualReason] = useState("");

  // Success dialog state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    hospitalName: "",
    machineType: "",
    machineModel: "",
    serialNumber: "",
    problemReported: "",
    servicePerformed: "",
    dateTime: new Date().toLocaleString("sv-SE").slice(0, 16), // Use local time in YYYY-MM-DDTHH:mm format
  });

  // Get existing facilities from job cards
  const existingFacilities = Array.from(
    new Set(getAllJobCards().map((card) => card.hospitalName))
  ).filter((facility) =>
    facility.toLowerCase().includes(facilitySearchTerm.toLowerCase())
  );

  // Close facility dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".facility-dropdown")) {
        setShowFacilityDropdown(false);
      }
    };

    if (showFacilityDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFacilityDropdown]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFacilitySelect = (facility: string) => {
    setFormData({ ...formData, hospitalName: facility });
    setShowFacilityDropdown(false);
    setFacilitySearchTerm("");
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "before" | "after"
  ) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (type === "before") {
          setBeforeServiceImages((prev) => [...prev, result]);
        } else {
          setAfterServiceImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFacilityStampImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Manual job card upload handlers
  const handleManualJobCardUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
        alert("Please upload a PDF or image file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      setManualJobCard(file);
    }
  };

  const removeImage = (index: number, type: "before" | "after") => {
    if (type === "before") {
      setBeforeServiceImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setAfterServiceImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const removeStampImage = () => {
    setFacilityStampImage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Handle manual job card upload
    if (isManualUpload) {
      if (!manualJobCard) {
        alert("Please upload a manual job card file");
        return;
      }
      if (!manualReason.trim()) {
        alert("Please provide a reason for manual upload");
        return;
      }

      setIsSubmitting(true);
      try {
        // Create a manual job card entry
        const manualJobCardData = {
          hospitalName: "Manual Upload",
          machineType: "Manual Upload",
          machineModel: "Manual Upload",
          serialNumber: "Manual Upload",
          problemReported: `Manual job card uploaded. Reason: ${manualReason}`,
          servicePerformed: "Manual job card uploaded",
          facilitySignature: "",
          engineerName: user?.name || "",
          engineerId: user?.engineerId || "",
          dateTime: new Date().toLocaleString("sv-SE").slice(0, 16),
          beforeServiceImages: [],
          afterServiceImages: [],
          facilityStampImage: "",
          status: "completed" as const,
          manualUpload: true,
          manualFile: manualJobCard.name,
          manualReason: manualReason,
        };

        const jobCardId = await addJobCard(manualJobCardData);

        // Send email with manual job card
        const jobCardForEmail = {
          ...manualJobCardData,
          id: jobCardId,
          createdAt: new Date().toISOString(),
        };

        // For manual uploads, we'll send the uploaded file as PDF
        const pdfBlob = new Blob([manualJobCard], { type: manualJobCard.type });
        const emailSent = await sendJobCardEmail(jobCardForEmail, pdfBlob);

        setSuccessMessage(
          `Manual Job Card ${jobCardId} uploaded successfully! ${
            emailSent ? "Email sent." : "Email failed to send."
          }`
        );
        setShowSuccess(true);

        // Reset form
        setIsManualUpload(false);
        setManualJobCard(null);
        setManualReason("");
        // Wait a bit so user can see dialog and then go back
        setTimeout(() => {
          setShowSuccess(false);
          onBack();
        }, 2000);
      } catch (error) {
        console.error("Error uploading manual job card:", error);
        alert("Error uploading manual job card. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Validate all required fields for regular job card
    if (!formData.hospitalName.trim()) {
      alert("Please enter hospital/facility name");
      return;
    }
    if (!formData.machineType.trim()) {
      alert("Please enter machine type");
      return;
    }
    if (!formData.machineModel.trim()) {
      alert("Please enter machine model");
      return;
    }
    if (!formData.serialNumber.trim()) {
      alert("Please enter serial number");
      return;
    }
    if (!formData.problemReported.trim()) {
      alert("Please describe the problem reported");
      return;
    }
    if (!formData.servicePerformed.trim()) {
      alert("Please describe the service performed");
      return;
    }
    if (!facilitySignature) {
      alert("Please provide facility representative signature");
      return;
    }

    if (beforeServiceImages.length === 0) {
      alert("Please upload at least one before-service photo");
      return;
    }

    if (afterServiceImages.length === 0) {
      alert("Please upload at least one after-service photo");
      return;
    }

    if (!facilityStampImage) {
      alert("Please upload the facility stamp image");
      return;
    }

    setIsSubmitting(true);
    setSubmissionStep("Preparing job card data...");
    console.log("Starting job card submission...");

    try {
      const jobCardData = {
        ...formData,
        facilitySignature,
        engineerSignature,
        engineerName: user?.name || "",
        engineerId: user?.engineerId || "",
        dateTime: formData.dateTime,
        beforeServiceImages,
        afterServiceImages,
        facilityStampImage,
        status: "completed" as const,
      };

      console.log("Job card data to submit:", jobCardData);

      // Create job card with timeout
      setSubmissionStep("Creating job card in database...");
      console.log("🔄 Creating job card in database...");
      const jobCardId = await Promise.race([
        addJobCard(jobCardData),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Job card creation timeout")),
            60000
          )
        ),
      ]);

      console.log("✅ Job card created successfully with ID:", jobCardId);

      // Send email notification to admin with timeout
      try {
        console.log("📧 Starting email notification process...");

        const jobCardForEmail = {
          ...jobCardData,
          id: jobCardId,
          createdAt: new Date().toISOString(),
          status: "completed" as const,
        };

        // Step 1: Generate PDF with timeout
        setSubmissionStep("Generating PDF report...");
        console.log("📄 Generating PDF for email...");
        const pdfBlob = await Promise.race([
          generateJobCardPDF(jobCardForEmail),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("PDF generation timeout")), 30000)
          ),
        ]);
        console.log("✅ PDF generated successfully");

        // Step 2: Send email with timeout
        setSubmissionStep("Sending email notification...");
        console.log("📤 Sending email notification...");
        const emailSent = await Promise.race([
          sendJobCardEmail(jobCardForEmail, pdfBlob),
          new Promise<boolean>((_, reject) =>
            setTimeout(() => reject(new Error("Email sending timeout")), 30000)
          ),
        ]);

        if (emailSent) {
          console.log("✅ Email notification sent successfully");
          setSuccessMessage(
            `Job Card ${jobCardId} created successfully! Email sent.`
          );
        } else {
          console.log("⚠️ Email notification failed, but job card was created");
          setSuccessMessage(
            `Job Card ${jobCardId} created successfully! Email failed to send.`
          );
        }
        setShowSuccess(true);
      } catch (emailError) {
        console.error("❌ Error in email notification process:", emailError);

        // Show specific error message
        const errorMessage =
          emailError instanceof Error ? emailError.message : "Unknown error";
        console.error("Email error details:", errorMessage);

        alert(
          `Job Card ${jobCardId} created successfully! (Email notification failed: ${errorMessage})`
        );
      }

      setTimeout(() => {
        setShowSuccess(false);
        onBack();
      }, 2000);
    } catch (error) {
      console.error("❌ Error creating job card:", error);

      // Show specific error message
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Job card creation error details:", errorMessage);

      let userMessage = "Error creating job card. Please try again.";

      // Provide more specific error messages
      if (errorMessage.includes("timeout")) {
        userMessage =
          "Job card creation timed out. Please check your internet connection and try again.";
      } else if (errorMessage.includes("network")) {
        userMessage =
          "Network error. Please check your internet connection and try again.";
      } else if (errorMessage.includes("database")) {
        userMessage = "Database error. Please try again in a few moments.";
      }

      alert(userMessage);
    } finally {
      setIsSubmitting(false);
      setSubmissionStep("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Job Card</h1>
              <p className="text-gray-600">Fill in all required details</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Manual Upload Toggle */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Upload className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Job Card Type
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="jobCardType"
                  checked={!isManualUpload}
                  onChange={() => setIsManualUpload(false)}
                  className="mr-2"
                />
                <span className="text-gray-700">Create New Job Card</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="jobCardType"
                  checked={isManualUpload}
                  onChange={() => setIsManualUpload(true)}
                  className="mr-2"
                />
                <span className="text-gray-700">Upload Manual Job Card</span>
              </label>
            </div>
          </section>

          {/* Manual Upload Section */}
          {isManualUpload && (
            <section className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-4">
                <Upload className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Manual Job Card Upload
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Job Card File *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleManualJobCardUpload}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Accepted formats: PDF, JPG, PNG (Max 10MB)
                  </p>
                  {manualJobCard && (
                    <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded">
                      <p className="text-sm text-green-700">
                        ✓ File selected: {manualJobCard.name} (
                        {(manualJobCard.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Manual Upload *
                  </label>
                  <textarea
                    value={manualReason}
                    onChange={(e) => setManualReason(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="Explain why you're uploading a manual job card instead of creating one..."
                    rows={3}
                    required
                  />
                </div>
              </div>
            </section>
          )}

          {/* Regular Job Card Form - Only show if not manual upload */}
          {!isManualUpload && (
            <>
              {/* Hospital/Facility Information */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Building className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Facility Information
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital/Facility Name *
                    </label>
                    <input
                      type="text"
                      name="hospitalName"
                      value={formData.hospitalName}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          hospitalName: e.target.value,
                        });
                        setFacilitySearchTerm(e.target.value);
                        setShowFacilityDropdown(true);
                      }}
                      onFocus={() => setShowFacilityDropdown(true)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Type to search or enter new facility"
                      required
                    />
                    {showFacilityDropdown && existingFacilities.length > 0 && (
                      <div className="facility-dropdown absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {existingFacilities.map((facility, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleFacilitySelect(facility)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            {facility}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="dateTime"
                      value={formData.dateTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Machine Details */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Machine Details
                  </h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Machine Type *
                    </label>
                    <input
                      type="text"
                      name="machineType"
                      value={formData.machineType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="e.g., X-Ray Machine, CT Scanner, etc."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Machine Model *
                    </label>
                    <input
                      type="text"
                      name="machineModel"
                      value={formData.machineModel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Serial Number *
                    </label>
                    <input
                      type="text"
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Service Details */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Service Details
                  </h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Problem Reported *
                    </label>
                    <textarea
                      name="problemReported"
                      value={formData.problemReported}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      placeholder="Describe the problem reported by the facility..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Performed *
                    </label>
                    <textarea
                      name="servicePerformed"
                      value={formData.servicePerformed}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      placeholder="Detail the service performed, parts replaced, diagnosis, etc..."
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Before Service Photos */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Camera className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Before Service Photos
                  </h2>
                </div>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, "before")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {beforeServiceImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {beforeServiceImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Before ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index, "before")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* After Service Photos */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Camera className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    After Service Photos
                  </h2>
                </div>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, "after")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {afterServiceImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {afterServiceImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`After ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index, "after")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Facility Stamp */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Facility Stamp
                  </h2>
                </div>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStampUpload}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {facilityStampImage && (
                    <div className="relative inline-block">
                      <img
                        src={facilityStampImage}
                        alt="Facility Stamp"
                        className="max-w-xs h-32 object-contain border rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeStampImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Engineer Information (Auto-filled) */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Engineer Information
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Engineer Name
                    </label>
                    <input
                      type="text"
                      value={user?.name || ""}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Engineer ID
                    </label>
                    <input
                      type="text"
                      value={user?.engineerId || ""}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600"
                      disabled
                    />
                  </div>
                </div>
              </section>

              {/* Digital Signatures */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Signature className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Digital Signatures
                  </h2>
                </div>

                {/* Facility Representative Signature */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-md font-medium text-gray-700">
                    Facility Representative Signature
                  </h3>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowFacilitySignature(true)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <Signature className="w-4 h-4" />
                      <span>Capture Facility Signature</span>
                    </button>
                    {facilitySignature && (
                      <span className="text-sm text-green-600 flex items-center">
                        ✓ Facility signature captured
                      </span>
                    )}
                  </div>
                  {facilitySignature && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <img
                        src={facilitySignature}
                        alt="Facility Signature"
                        className="max-w-xs h-20 border border-gray-200 rounded"
                      />
                    </div>
                  )}
                </div>

                {/* Engineer Signature */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-700">
                    Engineer Signature
                  </h3>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowEngineerSignature(true)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <Signature className="w-4 h-4" />
                      <span>Capture Engineer Signature</span>
                    </button>
                    {engineerSignature && (
                      <span className="text-sm text-green-600 flex items-center">
                        ✓ Engineer signature captured
                      </span>
                    )}
                  </div>
                  {engineerSignature && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <img
                        src={engineerSignature}
                        alt="Engineer Signature"
                        className="max-w-xs h-20 border border-gray-200 rounded"
                      />
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={
                isSubmitting ||
                (!isManualUpload &&
                  (!facilitySignature ||
                    !engineerSignature ||
                    beforeServiceImages.length === 0 ||
                    afterServiceImages.length === 0 ||
                    !facilityStampImage))
              }
              className={`px-8 py-3 rounded-lg font-medium focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
                isManualUpload
                  ? "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500"
                  : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>
                    {submissionStep ||
                      (isManualUpload
                        ? "Uploading Job Card..."
                        : "Creating Job Card...")}
                  </span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>
                    {isManualUpload ? "Upload Job Card" : "Create Job Card"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Dialog */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl text-center">
            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Success</h3>
            <p className="text-sm text-gray-600 mt-2">{successMessage}</p>
            <div className="mt-4">
              <button
                onClick={() => {
                  setShowSuccess(false);
                  onBack();
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Facility Signature Modal */}
      {showFacilitySignature && (
        <SignatureCanvas
          onSave={(signature) => {
            console.log(
              "Facility signature received in JobCardForm:",
              signature ? "Yes" : "No"
            );
            console.log("Facility signature length:", signature?.length || 0);
            setFacilitySignature(signature);
          }}
          onClose={() => setShowFacilitySignature(false)}
        />
      )}

      {/* Engineer Signature Modal */}
      {showEngineerSignature && (
        <SignatureCanvas
          onSave={(signature) => {
            console.log(
              "Engineer signature received in JobCardForm:",
              signature ? "Yes" : "No"
            );
            console.log("Engineer signature length:", signature?.length || 0);
            setEngineerSignature(signature);
          }}
          onClose={() => setShowEngineerSignature(false)}
        />
      )}
    </div>
  );
}
