import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Supabase Admin client (service role)
const supabaseAdmin =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    : null;

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

/**
 * Admin-only endpoint: create engineer in Supabase Auth and insert into engineers table
 * Security: Requires ADMIN_API_KEY header matching process.env.ADMIN_API_KEY
 */
app.post("/api/admin/create-engineer", async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res
        .status(500)
        .json({ success: false, error: "Supabase admin not configured" });
    }

    const apiKey = req.header("x-admin-api-key") || req.header("admin-api-key");
    if (!process.env.ADMIN_API_KEY || apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const { name, email, engineerId } = req.body || {};
    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, error: "name and email are required" });
    }

    // 1) Create user in Supabase Auth (send invite so engineer sets password)
    const { data: userData, error: createErr } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: false,
      });
    if (createErr) throw createErr;

    const userId = userData.user.id;

    // 2) Generate invite link for engineer to set password
    const { data: linkData, error: linkErr } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "invite",
        email,
      });
    if (linkErr) throw linkErr;

    // 3) Insert into engineers table (no password stored)
    const { error: dbErr } = await supabaseAdmin.from("engineers").insert({
      id: userId,
      name,
      email,
      engineer_id: engineerId || `ENG-${Date.now()}`,
    });
    if (dbErr) throw dbErr;

    return res.json({
      success: true,
      userId,
      inviteLink: linkData.properties?.action_link,
    });
  } catch (error) {
    console.error("❌ Admin create engineer failed:", error);
    return res
      .status(500)
      .json({ success: false, error: error.message || "Internal error" });
  }
});

// Export the app for Vercel
export default app;

// Start server only in development
if (process.env.NODE_ENV !== "production") {
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
}
