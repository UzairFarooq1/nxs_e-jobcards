# EmailJS Setup Guide

## Your EmailJS Configuration
- **Service ID**: `service_3zya3on`
- **Public Key**: `JMhuvm_lxCrEhXP_I`
- **Private Key**: `m-QMmqmzm_lTXj2FrjUeE` (keep this secure!)

## Step 1: Install EmailJS Package
```bash
npm install @emailjs/browser
```

## Step 2: Create Email Template in EmailJS Dashboard

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Navigate to **Email Templates**
3. Click **Create New Template**
4. Use this template ID: `template_jobcard`

### Template Content:
**Subject**: `New Job Card: {{job_card_id}} - {{hospital_name}}`

**Body**:
```
A new job card has been created:

Job Card ID: {{job_card_id}}
Hospital: {{hospital_name}}
Engineer: {{engineer_name}} ({{engineer_id}})
Machine: {{machine_type}} - {{machine_model}}
Serial Number: {{serial_number}}
Date: {{date_time}}

Problem Reported:
{{problem_reported}}

Service Performed:
{{service_performed}}

Note: The complete job card PDF is available in the admin dashboard.

---
This email was sent from the NXS E-JobCard System.
```

**Important EmailJS Service Configuration:**
- The EmailJS service should be configured with the admin's email account (it@vanguard-group.org)
- This ensures emails are sent FROM the admin's email address
- The system will send emails TO the admin's email address

## Step 3: Configure Email Service

1. In EmailJS Dashboard, go to **Email Services**
2. Make sure your service `service_3zya3on` is connected to your email provider
3. Verify the service is active

## Step 4: Test the Integration

1. Create a new job card
2. Check the browser console for EmailJS logs
3. Check your admin email for the notification

## Template Variables Available

The following variables are passed to your EmailJS template:

- `{{to_email}}` - Admin email address (recipient)
- `{{from_name}}` - Sender name ("NXS E-JobCard System")
- `{{reply_to}}` - Reply-to email address (admin's email)
- `{{subject}}` - Email subject
- `{{message}}` - Formatted message body
- `{{job_card_id}}` - Job card ID (e.g., NXS-00001)
- `{{hospital_name}}` - Hospital/facility name
- `{{engineer_name}}` - Engineer name
- `{{engineer_id}}` - Engineer ID
- `{{machine_type}}` - Machine type
- `{{machine_model}}` - Machine model
- `{{serial_number}}` - Serial number
- `{{problem_reported}}` - Problem description
- `{{service_performed}}` - Service performed description
- `{{date_time}}` - Formatted date and time
- `{{pdf_attachment}}` - Base64 encoded PDF (if supported)
- `{{pdf_filename}}` - PDF filename

## Troubleshooting

### If emails don't send:
1. Check browser console for errors
2. Verify EmailJS service is active
3. Check template ID matches exactly
4. Ensure all required template variables are provided

### If you get CORS errors:
1. Add your domain to EmailJS allowed origins
2. Check if you're testing on localhost (should work by default)

### Fallback Behavior:
If EmailJS fails, the system will automatically fall back to opening the user's email client with pre-filled content.

## Security Notes

- Keep your private key secure
- Don't commit private keys to version control
- Consider using environment variables for production
- The public key is safe to use in frontend code
