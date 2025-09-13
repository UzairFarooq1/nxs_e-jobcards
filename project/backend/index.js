import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

const app = express();
const PORT = process.env.PORT || 3001;

// CORS middleware - must be before other middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5500",
    "https://nxs-e-jobcards.vercel.app",
    "https://nxs-e-jobcards-frontend.vercel.app",
  ];

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    res.header("Access-Control-Allow-Origin", "*");
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, x-admin-api-key"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
});

// Other middleware
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
        options: {
          redirectTo: "https://nxs-e-jobcards.vercel.app/auth/callback",
        },
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

    // 4) Send invite email to engineer
    const inviteLink = linkData.properties?.action_link;
    if (inviteLink) {
      try {
        const transporter = createTransporter();
        const mailOptions = {
          from: process.env.SMTP_USER,
          to: email,
          subject: "Welcome to NXS E-JobCard System - Set Your Password",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb; text-align: center;">Welcome to NXS E-JobCard System</h2>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p>Hello <strong>${name}</strong>,</p>
                
                <p>An admin has created an account for you in the NXS E-JobCard System. To complete your account setup, please click the button below to set your password:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${inviteLink}" 
                     style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                    Set Your Password
                  </a>
                </div>
                
                <p><strong>Your Account Details:</strong></p>
                <ul>
                  <li><strong>Name:</strong> ${name}</li>
                  <li><strong>Email:</strong> ${email}</li>
                  <li><strong>Engineer ID:</strong> ${
                    engineerId || `ENG-${Date.now()}`
                  }</li>
                </ul>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  <strong>Note:</strong> This invite link will expire in 24 hours. If you don't set your password within this time, please contact your administrator.
                </p>
                
                <p style="color: #666; font-size: 14px;">
                  If the button doesn't work, you can copy and paste this link into your browser:<br>
                  <a href="${inviteLink}" style="color: #2563eb; word-break: break-all;">${inviteLink}</a>
                </p>
              </div>
              
              <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
                <p>This email was sent by the NXS E-JobCard System</p>
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Invite email sent successfully to ${email}`);
      } catch (emailError) {
        console.error("⚠️ Failed to send invite email:", emailError);
        // Don't fail the entire operation if email fails
      }
    }

    return res.json({
      success: true,
      userId,
      inviteLink,
      message: `Engineer account created successfully. Invite email sent to ${email}`,
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
