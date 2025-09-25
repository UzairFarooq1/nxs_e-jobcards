const nodemailer = require("nodemailer");
const multer = require("multer");

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Configure nodemailer with Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
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
        .maybeSingle();

      if (!engineerError && engineerData) {
        engineerEmail = engineerData.email;
        console.log("📧 Engineer email found:", engineerEmail);
      } else {
        console.log("📧 No engineer email found for engineer_id:", jobCard.engineerId);
        console.log("📧 Engineer lookup error:", engineerError);
        
        // Fallback: try to construct email from engineer name if available
        if (jobCard.engineerName) {
          const nameParts = jobCard.engineerName.toLowerCase().split(' ');
          if (nameParts.length >= 2) {
            const firstName = nameParts[0];
            const lastName = nameParts[nameParts.length - 1];
            engineerEmail = `${firstName}.${lastName}@nxsltd.com`;
            console.log("📧 Using fallback email:", engineerEmail);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching engineer email:", error);
    }

    // Email content with enhanced details
    console.log("📧 Email recipients:");
    console.log("📧 TO:", process.env.ADMIN_EMAIL || "it@vanguard-group.org");
    console.log("📧 CC Engineer:", engineerEmail);
    console.log("📧 CC Gladys: gladys.kariuki@nxsltd.com");
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || "it@vanguard-group.org",
      cc: [
        ...(engineerEmail ? [engineerEmail] : []),
        "gladys.kariuki@nxsltd.com",
      ],
      replyTo: process.env.REPLY_TO_EMAIL || process.env.SMTP_USER,
      subject: `🔧 New Job Card: ${jobCard.id} - ${jobCard.hospitalName}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 760px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #1d4ed8, #0ea5e9); padding: 20px 24px; color: #fff; display: flex; align-items: center;">
            <div style="font-size: 20px; font-weight: 700; letter-spacing: 0.3px;">Nairobi X-ray Supplies Ltd</div>
            <div style="margin-left: auto; font-size: 12px; opacity: 0.9;">E-JobCard System</div>
          </div>
          <div style="padding: 20px 24px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px; color: #111827;">
              <span style="font-size: 18px; font-weight: 700;">New Job Card Created</span>
              <span style="background: #dbeafe; color: #1d4ed8; font-size: 12px; padding: 4px 10px; border-radius: 999px; font-weight: 600;">${
                jobCard.id
              }</span>
            </div>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px; color: #374151;">
                <div><strong style="color:#111827;">Hospital/Facility:</strong> ${
                  jobCard.hospitalName
                }</div>
                <div><strong style="color:#111827;">Date:</strong> ${new Date(
                  jobCard.dateTime
                ).toLocaleString()}</div>
                <div><strong style="color:#111827;">Engineer:</strong> ${
                  jobCard.engineerName
                } (${jobCard.engineerId})</div>
                <div><strong style="color:#111827;">Serial No.:</strong> ${
                  jobCard.serialNumber
                }</div>
                <div><strong style="color:#111827;">Machine:</strong> ${
                  jobCard.machineType
                } — ${jobCard.machineModel}</div>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="border: 1px solid #fde68a; background: #fffbeb; border-radius: 10px; padding: 14px;">
                <div style="font-size: 13px; color: #92400e; font-weight: 700; margin-bottom: 8px;">Problem Reported</div>
                <div style="font-size: 14px; color: #78350f; line-height: 1.5;">${
                  jobCard.problemReported
                }</div>
              </div>
              <div style="border: 1px solid #bfdbfe; background: #eff6ff; border-radius: 10px; padding: 14px;">
                <div style="font-size: 13px; color: #1e40af; font-weight: 700; margin-bottom: 8px;">Service Performed</div>
                <div style="font-size: 14px; color: #1e3a8a; line-height: 1.5;">${
                  jobCard.servicePerformed
                }</div>
              </div>
            </div>
            <div style="margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
              <div style="background:#f3f4f6; border-radius: 8px; padding:10px; text-align:center; font-size: 12px; color:#374151;">${
                jobCard.facilitySignature
                  ? "✅ Facility Signature"
                  : "❌ Facility Signature"
              }</div>
              <div style="background:#f3f4f6; border-radius: 8px; padding:10px; text-align:center; font-size: 12px; color:#374151;">${
                jobCard.engineerSignature
                  ? "✅ Engineer Signature"
                  : "❌ Engineer Signature"
              }</div>
              <div style="background:#f3f4f6; border-radius: 8px; padding:10px; text-align:center; font-size: 12px; color:#374151;">${
                jobCard.facilityStampImage
                  ? "✅ Facility Stamp"
                  : "❌ Facility Stamp"
              }</div>
            </div>
            <div style="margin-top: 18px; background: #ecfeff; border: 1px dashed #67e8f9; color: #0e7490; padding: 12px; border-radius: 10px; font-size: 13px;">
              📎 The complete job card PDF is attached.
            </div>
            <div style="margin-top: 22px; text-align:center; color:#6b7280; font-size:12px;">
              Generated by NXS E-JobCard System • Nairobi X-ray Supplies Ltd<br/>
              ${new Date().toLocaleString()}
            </div>
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
