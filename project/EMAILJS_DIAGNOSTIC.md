# EmailJS Diagnostic Guide

## 🚨 Current Error
```
POST https://api.emailjs.com/api/v1.0/email/send-form 400 (Bad Request)
The template ID not found. To find this ID, visit https://dashboard.emailjs.com/admin/templates
```

## 🔍 Diagnostic Steps

### Step 1: Check Your EmailJS Dashboard
1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Login with your account
3. Check the following:

#### 1.1 Email Services
- Go to **Email Services** tab
- Verify `service_3zya3on` exists
- Check if it's **Active** (not paused)
- Verify it's connected to your email provider

#### 1.2 Templates
- Go to **Templates** tab
- Check what templates exist
- Look for `template_contact_form` (default)
- If you created `template_jobcard`, verify it exists

#### 1.3 Account Settings
- Go to **Account** tab
- Verify **Public Key**: `JMhuvm_lxCrEhXP_I`
- Check if your account is active

### Step 2: Test with Simple Template
I've added a **"EmailJS Simple Test"** component that uses the most basic setup:

1. **Uses default template**: `template_contact_form`
2. **Uses standard fields**: `user_name`, `user_email`, `message`
3. **Should work immediately** if EmailJS is properly configured

### Step 3: Check Browser Console
When you test, check the browser console for:
- **Success**: `Email sent successfully: {status: 200, text: "OK"}`
- **Error**: Detailed error message with specific issue

## 🛠️ Quick Fixes

### Fix 1: Use Default Template
The updated test now uses `template_contact_form` which should exist by default.

### Fix 2: Create Missing Template
If you want to use `template_jobcard`:
1. Go to [EmailJS Templates](https://dashboard.emailjs.com/admin/templates)
2. Click **"Create New Template"**
3. Set **Template ID**: `template_jobcard`
4. Use the template content from `EMAILJS_TEMPLATE_SETUP.md`

### Fix 3: Check Service Connection
1. Go to [EmailJS Services](https://dashboard.emailjs.com/admin/integration)
2. Verify `service_3zya3on` is connected
3. Test the connection if possible

## 🧪 Testing Order

### Test 1: Simple Test (Should Work)
1. Go to Admin Dashboard
2. Find **"EmailJS Simple Test"** (blue box)
3. Click **"Send Test Email"**
4. Check console and email

### Test 2: Custom Test (May Need Template)
1. Find **"EmailJS Direct Test"** (gray box)
2. Click **"Send Test Email"**
3. If it fails, create the template

### Test 3: Real Job Card
1. Create a job card as engineer
2. Check if email is sent automatically
3. Verify email content

## 📋 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Template not found | Template doesn't exist | Create template or use default |
| Service not found | Service ID wrong | Check EmailJS dashboard |
| Public key error | Key incorrect | Verify in account settings |
| CORS error | Domain not allowed | Add domain to allowed origins |
| 400 Bad Request | Invalid parameters | Check template variables |

## 🎯 Next Steps

1. **Immediate**: Test the **"EmailJS Simple Test"** (should work)
2. **If simple test works**: Your EmailJS is configured correctly
3. **If simple test fails**: Check your EmailJS service connection
4. **Create custom template**: For better job card emails
5. **Test real job cards**: Verify automatic email sending

## 📞 Need Help?

If the simple test still fails:
1. Check your EmailJS dashboard
2. Verify service is active
3. Check browser console for specific errors
4. Try creating a new service if needed

The simple test should work with the default EmailJS setup!
