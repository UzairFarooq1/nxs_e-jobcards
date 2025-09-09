const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Google Drive setup
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const SERVICE_ACCOUNT_KEY = {
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  "client_email": process.env.GOOGLE_CLIENT_EMAIL,
  "client_id": process.env.GOOGLE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
};
// Middleware
app.use(cors());
app.use(express.json());

// Create transporter for Gmail SMTP
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter verification failed:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Google Drive upload function
async function uploadToDrive(fileName, fileContent, mimeType = 'application/pdf') {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: SERVICE_ACCOUNT_KEY,
      scopes: SCOPES,
    });

    const drive = google.drive({ version: 'v3', auth });

    // Create folder if it doesn't exist
    const folderName = 'NXS JobCards';
    let folderId = await findOrCreateFolder(drive, folderName);

    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType: mimeType,
      body: Buffer.from(fileContent, 'base64'),
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
    });

    // Share with admin email
    await drive.permissions.create({
      fileId: file.data.id,
      resource: {
        role: 'writer',
        type: 'user',
        emailAddress: process.env.ADMIN_EMAIL,
      },
    });

    return file.data.id;
  } catch (error) {
    console.error('Error uploading to Drive:', error);
    throw error;
  }
}

async function findOrCreateFolder(drive, folderName) {
  try {
    const response = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id, name)',
    });

    if (response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // Create folder
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: 'id',
    });

    // Share folder with admin
    await drive.permissions.create({
      fileId: folder.data.id,
      resource: {
        role: 'writer',
        type: 'user',
        emailAddress: process.env.ADMIN_EMAIL,
      },
    });

    return folder.data.id;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
}

// Enhanced email sending with Google Drive integration
app.post('/api/send-email-with-drive', async (req, res) => {
  try {
    const { to, subject, html, attachments, jobCard } = req.body;

    let driveFileId = null;
    
    // Upload PDF to Google Drive if attachment exists
    if (attachments && attachments.length > 0) {
      const pdfAttachment = attachments[0];
      driveFileId = await uploadToDrive(
        pdfAttachment.filename,
        pdfAttachment.content,
        'application/pdf'
      );
    }

    const mailOptions = {
      from: `"Nairobi X-ray Supplies Ltd" <${process.env.EMAIL_USER}>`,
      to: to || process.env.ADMIN_EMAIL,
      subject,
      html,
      attachments: attachments || []
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent and PDF saved to Drive:', info.messageId, driveFileId);
    res.status(200).json({ 
      success: true, 
      messageId: info.messageId,
      driveFileId: driveFileId,
      message: 'Email sent and PDF saved to Google Drive successfully' 
    });

  } catch (error) {
    console.error('Failed to send email or save to Drive:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Failed to send email or save to Google Drive' 
    });
  }
});

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, attachments } = req.body;

    const mailOptions = {
      from: `"Nairobi X-ray Supplies Ltd" <${process.env.EMAIL_USER}>`,
      to: to || process.env.ADMIN_EMAIL,
      subject,
      html,
      attachments: attachments || []
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    res.status(200).json({ 
      success: true, 
      messageId: info.messageId,
      message: 'Email sent successfully' 
    });

  } catch (error) {
    console.error('Failed to send email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Failed to send email' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Email server is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
  console.log(`Admin email configured: ${process.env.ADMIN_EMAIL}`);
});

module.exports = app;