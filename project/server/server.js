const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config({ path: "./config.env" });

const app = express();
const PORT = process.env.PORT || 3001;

// Handle preflight requests
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.status(200).end();
});

// Middleware
app.use(
  cors({
    origin: [
      process.env.CORS_ORIGIN || "http://localhost:5173",
      "https://nxs-e-jobcards.vercel.app",
      "https://nxs-e-jobcards-frontend.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Create Gmail SMTP transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Test SMTP connection
const testSMTPConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Gmail SMTP connection verified successfully");
    return true;
  } catch (error) {
    console.error("❌ Gmail SMTP connection failed:", error.message);
    return false;
  }
};

// Email sending endpoint
app.post("/api/send-jobcard-email", upload.single("pdf"), async (req, res) => {
  try {
    const { jobCardData } = req.body;
    const pdfBuffer = req.file ? req.file.buffer : null;

    if (!jobCardData) {
      return res.status(400).json({
        success: false,
        error: "Job card data is required",
      });
    }

    const jobCard = JSON.parse(jobCardData);
    console.log(`📧 Sending job card email for: ${jobCard.id}`);

    // Create transporter
    const transporter = createTransporter();

    // Email content
    const subject = `New Job Card: ${jobCard.id} - ${jobCard.hospitalName}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Job Card Created</h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">Job Card Details</h3>
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
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #1e40af;">Problem Reported</h3>
          <p style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; border-radius: 4px;">
            ${jobCard.problemReported}
          </p>
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #1e40af;">Service Performed</h3>
          <p style="background-color: #f0fdf4; padding: 15px; border-left: 4px solid #22c55e; border-radius: 4px;">
            ${jobCard.servicePerformed}
          </p>
        </div>

        ${
          pdfBuffer
            ? `
          <div style="margin: 20px 0; padding: 15px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="color: #1e40af; margin-top: 0;">Job Card PDF</h3>
            <p style="margin: 10px 0; color: #4b5563;">
              <strong>Filename:</strong> jobcard-${jobCard.id}.pdf
            </p>
            <p style="font-size: 12px; color: #6b7280; margin: 10px 0 0 0;">
              The complete job card PDF is attached to this email.
            </p>
          </div>
        `
            : ""
        }
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          <p>This email was sent from the NXS E-JobCard System.</p>
          <p>For any questions, please contact the system administrator.</p>
        </div>
      </div>
    `;

    // Email options
    const mailOptions = {
      from: {
        name: "NXS E-JobCard System",
        address: process.env.SMTP_USER,
      },
      to: process.env.SMTP_USER, // Send to admin email
      subject: subject,
      html: htmlContent,
      attachments: pdfBuffer
        ? [
            {
              filename: `jobcard-${jobCard.id}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ]
        : [],
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);

    res.json({
      success: true,
      messageId: info.messageId,
      message: "Job card email sent successfully",
    });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  const smtpStatus = await testSMTPConnection();
  res.json({
    status: "ok",
    smtp: smtpStatus ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Gmail SMTP configured for: ${process.env.SMTP_USER}`);

  // Test SMTP connection on startup
  await testSMTPConnection();
});

module.exports = app;
