# EmailJS Template Setup - Fix Template Not Found Error

## 🚨 Current Issue
**Error**: `The template ID not found. To find this ID, visit https://dashboard.emailjs.com/admin/templates`

## 🔧 Quick Fix Steps

### Step 1: Check Existing Templates
1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/admin/templates)
2. Check what templates already exist
3. Look for `template_contact_form` (default template)

### Step 2: Use Existing Template (Quick Test)
I've updated the test to use `template_contact_form` which should exist by default.

### Step 3: Create Custom Template (Recommended)

#### 3.1 Create New Template
1. Go to [EmailJS Templates](https://dashboard.emailjs.com/admin/templates)
2. Click **"Create New Template"**
3. Set **Template ID**: `template_jobcard`
4. Set **Template Name**: "Job Card Notification"

#### 3.2 Template Content

**Subject:**
```
New Job Card: {{job_card_id}} - {{hospital_name}}
```

**Body (HTML):**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #2563eb;">New Job Card Created</h2>
  
  <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1e40af;">Job Card Details</h3>
    <p><strong>Job Card ID:</strong> {{job_card_id}}</p>
    <p><strong>Hospital:</strong> {{hospital_name}}</p>
    <p><strong>Engineer:</strong> {{engineer_name}} ({{engineer_id}})</p>
    <p><strong>Machine:</strong> {{machine_type}} - {{machine_model}}</p>
    <p><strong>Serial Number:</strong> {{serial_number}}</p>
    <p><strong>Date:</strong> {{date_time}}</p>
  </div>
  
  <div style="margin: 20px 0;">
    <h3 style="color: #1e40af;">Problem Reported</h3>
    <p style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; border-radius: 4px;">
      {{problem_reported}}
    </p>
  </div>
  
  <div style="margin: 20px 0;">
    <h3 style="color: #1e40af;">Service Performed</h3>
    <p style="background-color: #f0fdf4; padding: 15px; border-left: 4px solid #22c55e; border-radius: 4px;">
      {{service_performed}}
    </p>
  </div>
  
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
    <p>This email was sent from the NXS E-JobCard System.</p>
    <p>For any questions, please contact the system administrator.</p>
  </div>
</div>
```

#### 3.3 Template Variables
Make sure these variables are available in your template:
- `{{job_card_id}}`
- `{{hospital_name}}`
- `{{engineer_name}}`
- `{{engineer_id}}`
- `{{machine_type}}`
- `{{machine_model}}`
- `{{serial_number}}`
- `{{problem_reported}}`
- `{{service_performed}}`
- `{{date_time}}`

### Step 4: Test the Template

#### 4.1 Test with Default Template
1. Use the updated `EmailJSTest` component
2. It now uses `template_contact_form`
3. This should work immediately

#### 4.2 Test with Custom Template
1. After creating `template_jobcard`
2. Update the test component back to use `template_jobcard`
3. Test the form submission

### Step 5: Update Production Code

Once the template is working, update the main email service:

```typescript
// In src/utils/emailService.ts
const response = await emailjs.send(
  EMAIL_CONFIG.EMAILJS.SERVICE_ID,
  'template_jobcard', // Your custom template
  templateParams,
  EMAIL_CONFIG.EMAILJS.PUBLIC_KEY
);
```

## 🧪 Testing Steps

### Test 1: Default Template
1. Go to Admin Dashboard
2. Find "EmailJS Direct Test" section
3. Click "Send Test Email"
4. Should work with `template_contact_form`

### Test 2: Custom Template
1. Create `template_jobcard` in EmailJS dashboard
2. Update test component to use `template_jobcard`
3. Test again

### Test 3: Real Job Card
1. Create a real job card as engineer
2. Check if email is sent automatically
3. Verify email content

## 🔍 Troubleshooting

### Template Not Found
- **Cause**: Template ID doesn't exist in EmailJS
- **Fix**: Create template or use existing one

### Variables Not Populating
- **Cause**: Variable names don't match
- **Fix**: Check form field names match template variables

### Service Not Connected
- **Cause**: EmailJS service not properly configured
- **Fix**: Reconnect service in EmailJS dashboard

### CORS Errors
- **Cause**: Domain not allowed
- **Fix**: Add domain to EmailJS allowed origins

## 📋 Quick Checklist

- [ ] EmailJS service connected (`service_3zya3on`)
- [ ] Template exists (`template_contact_form` or `template_jobcard`)
- [ ] Public key correct (`JMhuvm_lxCrEhXP_I`)
- [ ] Form field names match template variables
- [ ] Test email sends successfully
- [ ] Real job card triggers email

## 🎯 Next Steps

1. **Immediate**: Test with `template_contact_form` (should work now)
2. **Short-term**: Create `template_jobcard` for better formatting
3. **Long-term**: Customize template with your branding
