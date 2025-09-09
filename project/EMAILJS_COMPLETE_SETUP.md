# Complete EmailJS Setup Guide for NXS E-JobCard System

## Step 1: EmailJS Account Setup

### 1.1 Create EmailJS Account
1. Go to [EmailJS Website](https://www.emailjs.com/)
2. Create an account
3. Verify your email address

### 1.2 Connect Email Service
1. In EmailJS Dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook 365, etc.)
4. **Important**: Connect using admin's email account (`it@vanguard-group.org`)
5. Note down the **Service ID**: `service_3zya3on`

### 1.3 Create Email Template
1. Go to **Email Templates**
2. Click **Create New Template**
3. Set **Template ID**: `template_jobcard`
4. Use the template content below

### 1.4 Get Public Key
1. Go to **Account Settings**
2. Find **Public Key**: `JMhuvm_lxCrEhXP_I`

## Step 2: Email Template Configuration

### Template ID: `template_jobcard`

**Subject:**
```
New Job Card: {{job_card_id}} - {{hospital_name}}
```

**Body:**
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

## Step 3: React Integration (Already Implemented)

### 3.1 Package Installation
```bash
npm install @emailjs/browser
```

### 3.2 Email Service Configuration
The email service is already configured in `src/utils/emailService.ts` with:
- **Service ID**: `service_3zya3on`
- **Template ID**: `template_jobcard`
- **Public Key**: `JMhuvm_lxCrEhXP_I`

### 3.3 Email Flow
```
Job Card Created → PDF Generated → EmailJS Service → Admin's Email
                                                      ↓
FROM: it@vanguard-group.org → TO: it@vanguard-group.org
```

## Step 4: Template Variables

The following variables are automatically passed to your EmailJS template:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{to_email}}` | Admin email address | it@vanguard-group.org |
| `{{from_name}}` | Sender name | NXS E-JobCard System |
| `{{reply_to}}` | Reply-to email | it@vanguard-group.org |
| `{{subject}}` | Email subject | New Job Card: NXS-00001 - Test Hospital |
| `{{message}}` | Formatted message | Full job card details |
| `{{job_card_id}}` | Job card number | NXS-00001 |
| `{{hospital_name}}` | Hospital name | Test Hospital |
| `{{engineer_name}}` | Engineer name | John Doe |
| `{{engineer_id}}` | Engineer ID | ENG-001 |
| `{{machine_type}}` | Machine type | X-Ray Machine |
| `{{machine_model}}` | Machine model | Model 123 |
| `{{serial_number}}` | Serial number | SN123456 |
| `{{problem_reported}}` | Problem description | Machine not working |
| `{{service_performed}}` | Service performed | Replaced faulty part |
| `{{date_time}}` | Date and time | 1/9/2025, 10:30:00 AM |

## Step 5: Testing

### 5.1 Test Email Function
1. Go to **Admin Dashboard**
2. Find **Email Test** section
3. Click **Test Email** button
4. Check console for logs
5. Check admin email for notification

### 5.2 Test Real Job Card
1. Create a new job card as an engineer
2. Verify email is sent automatically
3. Check email content matches job card data

## Step 6: Troubleshooting

### Common Issues:

#### Emails not sending:
1. Check browser console for errors
2. Verify EmailJS service is active
3. Check template ID matches exactly
4. Ensure all required variables are provided

#### Template variables empty:
1. Verify template ID is correct
2. Check variable names match exactly
3. Ensure template is saved properly

#### CORS errors:
1. Add your domain to EmailJS allowed origins
2. Check if testing on localhost (should work by default)

#### Sender/Recipient issues:
1. Verify EmailJS service is connected to admin's email
2. Check email provider settings
3. Ensure SMTP is configured correctly

## Step 7: Production Deployment

### 7.1 Environment Variables (Optional)
For better security, you can move credentials to environment variables:

```env
REACT_APP_EMAILJS_SERVICE_ID=service_3zya3on
REACT_APP_EMAILJS_TEMPLATE_ID=template_jobcard
REACT_APP_EMAILJS_PUBLIC_KEY=JMhuvm_lxCrEhXP_I
```

### 7.2 Domain Configuration
1. Add your production domain to EmailJS allowed origins
2. Test email functionality on production domain
3. Monitor email delivery rates

## Step 8: Monitoring

### 8.1 Email Delivery
- Check admin email regularly for job card notifications
- Monitor EmailJS dashboard for delivery statistics
- Set up email forwarding if needed

### 8.2 Error Handling
- The system automatically falls back to mailto if EmailJS fails
- Check browser console for error logs
- Monitor user feedback for email issues

## Success Indicators

✅ **EmailJS service connected** to admin's email account
✅ **Template created** with correct ID and content
✅ **Test email** sends successfully
✅ **Real job cards** trigger email notifications
✅ **Emails appear** in admin's inbox
✅ **Sender/recipient** are both admin's email
✅ **Template variables** populate correctly
