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

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || "it@vanguard-group.org",
      cc: engineerEmail || undefined, // CC engineer if email found
      subject: `New Job Card: ${jobCard.id} - ${jobCard.hospitalName}`,
      html: `
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
