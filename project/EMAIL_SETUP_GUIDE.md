# Email Setup Guide for Job Card Notifications

## Overview
The system sends email notifications to the admin when a new job card is created. Currently, it uses a fallback method that opens the user's email client.

## Current Implementation
- **Fallback Method**: Opens user's email client with job card details
- **Admin Email**: `it@vanguard-group.org`
- **PDF Generation**: Creates a text-based PDF attachment

## Setup Options

### Option 1: EmailJS (Recommended for Production)
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Create a free account
3. Add your email service (Gmail, Outlook, etc.)
4. Get your Service ID, Template ID, and Public Key
5. Update the email service configuration

### Option 2: Custom Email API
1. Set up a backend service (Node.js, Python, etc.)
2. Use services like:
   - SendGrid
   - Mailgun
   - AWS SES
   - Nodemailer with SMTP

### Option 3: Serverless Functions
1. Use Vercel Functions or Netlify Functions
2. Create an API endpoint for sending emails
3. Update the frontend to call this endpoint

## Current Fallback Behavior
When a job card is created:
1. Job card is saved to database
2. PDF is generated
3. User's email client opens with:
   - To: `it@vanguard-group.org`
   - Subject: `New Job Card: NXS-00001 - Hospital Name`
   - Body: Job card details
   - Note: PDF attachment is mentioned but not actually attached

## Testing
1. Create a new job card
2. Check console for email-related logs
3. Email client should open with job card details
4. Admin can manually save the PDF from the dashboard

## Future Improvements
- Implement proper email service integration
- Add PDF attachment capability
- Add email templates
- Add email delivery status tracking
