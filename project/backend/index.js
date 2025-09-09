import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import multer from "multer";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Configure nodemailer with Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Health check endpoint
app.get("/api/health", (req, res) => {
  try {
    // Check if required environment variables are set
    const smtpConfigured = !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      smtp: smtpConfigured ? "configured" : "not_configured",
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Send job card email endpoint
app.post("/api/send-jobcard-email", upload.single("pdf"), async (req, res) => {
  try {
    const { jobCardData, htmlContent, pdf } = req.body;

    if (!jobCardData || !req.file) {
      return res
        .status(400)
        .json({ error: "Missing job card data or PDF file" });
    }

    const jobCard = JSON.parse(jobCardData);
    const transporter = createTransporter();

    // Use the beautiful HTML template from frontend, or fallback to simple template
    const emailHTML =
      htmlContent ||
      `
      <h2>New Job Card Created</h2>
      <p><strong>Job Card ID:</strong> ${jobCard.id}</p>
      <p><strong>Hospital:</strong> ${jobCard.hospitalName}</p>
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
      <h3>Problem Reported:</h3>
      <p>${jobCard.problemReported}</p>
      <h3>Service Performed:</h3>
      <p>${jobCard.servicePerformed}</p>
      <p><em>Job card PDF is attached to this email.</em></p>
    `;

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || "it@vanguard-group.org",
      subject: `🔧 New Job Card: ${jobCard.id} - ${jobCard.hospitalName}`,
      html: emailHTML,
      attachments: [
        {
          filename: `jobcard-${jobCard.id}.pdf`,
          content: req.file.buffer,
          contentType: "application/pdf",
        },
      ],
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", info.messageId);

    res.json({
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
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NXS Backend Server running on port ${PORT}`);
  console.log(
    `📧 SMTP configured: ${!!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    )}`
  );
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
