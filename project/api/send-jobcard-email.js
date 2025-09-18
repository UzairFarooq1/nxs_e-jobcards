const nodemailer = require("nodemailer");
const multer = require("multer");

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Configure nodemailer with Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER || "it@vanguard-group.org",
      pass: process.env.SMTP_PASS || "alebxmozexpbfzek",
    },
  });
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse multipart form data
    const formData = await new Promise((resolve, reject) => {
      upload.single("pdf")(req, res, (err) => {
        if (err) reject(err);
        else resolve({ jobCardData: req.body.jobCardData, pdf: req.file });
      });
    });

    const { jobCardData, pdf } = formData;

    if (!jobCardData || !pdf) {
      return res
        .status(400)
        .json({ error: "Missing job card data or PDF file" });
    }

    const jobCard = JSON.parse(jobCardData);
    const transporter = createTransporter();

    // Get engineer's email from database
    let engineerEmail = null;
    try {
      const { createClient } = require("@supabase/supabase-js");
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { data: engineerData, error: engineerError } = await supabase
        .from("engineers")
        .select("email")
        .eq("engineer_id", jobCard.engineerId)
        .single();

      if (!engineerError && engineerData) {
        engineerEmail = engineerData.email;
        console.log("📧 Engineer email found:", engineerEmail);
      }
    } catch (error) {
      console.error("Error fetching engineer email:", error);
    }

    // Email content with enhanced details
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || "it@vanguard-group.org",
      cc: engineerEmail || undefined, // CC engineer if email found
      subject: `🔧 New Job Card: ${jobCard.id} - ${jobCard.hospitalName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            🔧 New Job Card Created
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Job Card Details</h3>
            <p><strong>Job Card ID:</strong> ${jobCard.id}</p>
            <p><strong>Hospital/Facility:</strong> ${jobCard.hospitalName}</p>
            <p><strong>Engineer:</strong> ${jobCard.engineerName} (${
        jobCard.engineerId
      })</p>
            <p><strong>Machine:</strong> ${jobCard.machineType} - ${
        jobCard.machineModel
      }</p>
            <p><strong>Serial Number:</strong> ${jobCard.serialNumber}</p>
            <p><strong>Date:</strong> ${new Date(
              jobCard.dateTime
            ).toLocaleString()}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Problem Reported</h3>
            <p style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px;">
              ${jobCard.problemReported}
            </p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Service Performed</h3>
            <p style="background: #d1ecf1; padding: 15px; border-left: 4px solid #17a2b8; border-radius: 4px;">
              ${jobCard.servicePerformed}
            </p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Signatures & Documentation</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 5px 0;">${
                jobCard.facilitySignature
                  ? "✅ Facility Representative Signature"
                  : "❌ Facility Representative Signature"
              }</li>
              <li style="margin: 5px 0;">${
                jobCard.engineerSignature
                  ? "✅ Engineer Signature"
                  : "❌ Engineer Signature"
              }</li>
              <li style="margin: 5px 0;">${
                jobCard.beforeServiceImages &&
                jobCard.beforeServiceImages.length > 0
                  ? `✅ Before Service Photos (${jobCard.beforeServiceImages.length})`
                  : "❌ Before Service Photos"
              }</li>
              <li style="margin: 5px 0;">${
                jobCard.afterServiceImages &&
                jobCard.afterServiceImages.length > 0
                  ? `✅ After Service Photos (${jobCard.afterServiceImages.length})`
                  : "❌ After Service Photos"
              }</li>
              <li style="margin: 5px 0;">${
                jobCard.facilityStampImage
                  ? "✅ Facility Stamp"
                  : "❌ Facility Stamp"
              }</li>
            </ul>
          </div>
          
          <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0066cc;">
              <strong>📎 Complete job card PDF with all signatures and attachments is attached to this email.</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
            <p>Generated by NXS E-JobCard System | Nairobi X-ray Supplies Ltd</p>
            <p>${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `jobcard-${jobCard.id}.pdf`,
          content: pdf.buffer,
          contentType: "application/pdf",
        },
      ],
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", info.messageId);

    res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: "Job card email sent successfully",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to send email",
    });
  }
}

// Configure API route for Vercel
export const config = {
  api: {
    bodyParser: false, // Disable body parsing, we'll handle it with multer
  },
};
