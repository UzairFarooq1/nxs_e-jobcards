# EmailJS Service Setup Guide

## Email Flow Configuration
The system is configured to send emails **FROM** the admin's email address **TO** the admin's email address.

## EmailJS Service Configuration

### 1. Service Setup
- **Service ID**: `service_3zya3on`
- **Email Provider**: Configure with admin's email account
- **From Email**: `it@vanguard-group.org`
- **To Email**: `it@vanguard-group.org`

### 2. Email Provider Configuration
In your EmailJS service settings:

1. **Connect your email provider** (Gmail, Outlook, etc.)
2. **Use admin's email credentials**: `it@vanguard-group.org`
3. **Enable SMTP** if required
4. **Test the connection** to ensure it works

### 3. Template Configuration
Create template with ID: `template_jobcard`

**Template Variables to Use:**
- `{{to_email}}` - Will be set to admin's email
- `{{from_name}}` - Will be "NXS E-JobCard System"
- `{{reply_to}}` - Will be admin's email
- `{{job_card_id}}` - Job card number (e.g., NXS-00001)
- `{{hospital_name}}` - Hospital name
- `{{engineer_name}}` - Engineer name
- `{{engineer_id}}` - Engineer ID
- `{{machine_type}}` - Machine type
- `{{machine_model}}` - Machine model
- `{{serial_number}}` - Serial number
- `{{problem_reported}}` - Problem description
- `{{service_performed}}` - Service performed
- `{{date_time}}` - Date and time

### 4. Email Flow
```
Job Card Created → System generates PDF → EmailJS sends email
                                                      ↓
Admin's Email (it@vanguard-group.org) → Admin's Email (it@vanguard-group.org)
```

### 5. Testing
1. **Test Email Service**: Use the "Test Email" button in admin dashboard
2. **Check Email Delivery**: Verify emails arrive in admin's inbox
3. **Check Sender**: Ensure emails appear to come from admin's email
4. **Check Recipient**: Ensure emails are sent to admin's email

## Troubleshooting

### If emails don't arrive:
1. Check spam/junk folder
2. Verify EmailJS service is active
3. Check email provider settings
4. Verify template ID matches exactly

### If sender appears incorrect:
1. Check EmailJS service configuration
2. Verify email provider is connected to admin's account
3. Check SMTP settings if applicable

### If template variables are empty:
1. Verify template ID is correct
2. Check variable names match exactly
3. Ensure all required variables are provided
