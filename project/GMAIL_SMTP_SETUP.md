# Gmail SMTP Setup Guide

## ✅ Gmail SMTP Integration Complete!

I've implemented Gmail SMTP to replace EmailJS, using your provided credentials.

### **📧 Gmail SMTP Configuration:**
- **SMTP Host**: smtp.gmail.com
- **Port**: 465 (SSL)
- **User**: it@vanguard-group.org
- **App Password**: alebxmozexpbfzek ✅

## 🚀 Quick Start

### **1. Start the Backend Server**
```bash
# Option 1: Use the batch file (Windows)
start-server.bat

# Option 2: Manual commands
cd server
npm install
npm start
```

### **2. Start the Frontend**
```bash
# In a new terminal
npm run dev
```

### **3. Test the System**
1. **Go to Admin Dashboard**
2. **Find "Gmail SMTP Test"** (blue box)
3. **Click "Test Connection"** - should show ✅ Connected
4. **Click "Test Email"** - should send email to admin

## 📁 Files Created

### **Backend Server:**
- `server/package.json` - Node.js dependencies
- `server/server.js` - Express server with Gmail SMTP
- `server/config.env` - Gmail SMTP credentials
- `start-server.bat` - Windows startup script

### **Frontend Updates:**
- `src/utils/gmailEmailService.ts` - Gmail SMTP service
- `src/components/GmailSMTPTest.tsx` - Test component
- Updated `JobCardForm.tsx` and `EmailTest.tsx` to use Gmail SMTP

## 🔧 How It Works

### **Email Flow:**
1. **Job Card Created** → PDF Generated
2. **Frontend** → Sends PDF + data to backend
3. **Backend** → Uses Gmail SMTP to send email
4. **Admin** → Receives email with PDF attachment

### **No More Size Limits:**
- ✅ **No 50KB limit** like EmailJS
- ✅ **PDFs of any size** can be attached
- ✅ **Reliable delivery** via Gmail SMTP
- ✅ **Professional emails** from admin's Gmail account

## 🧪 Testing

### **Test 1: Connection Test**
- **Click "Test Connection"** in Gmail SMTP Test
- **Should show**: ✅ Connected
- **If fails**: Check server is running on port 3001

### **Test 2: Email Test**
- **Click "Test Email"** in Gmail SMTP Test
- **Check admin email** for test message
- **Should have**: PDF attachment

### **Test 3: Real Job Card**
- **Create job card** as engineer
- **Check admin email** for notification
- **Should have**: Complete job card PDF

## 🔍 Troubleshooting

### **Server Won't Start:**
```bash
cd server
npm install
npm start
```

### **Connection Failed:**
- Check if port 3001 is available
- Verify Gmail app password is correct
- Check if 2FA is enabled on Gmail account

### **Email Not Sending:**
- Check server console for errors
- Verify Gmail credentials in `server/config.env`
- Check Gmail account security settings

### **CORS Errors:**
- Make sure frontend runs on http://localhost:5173
- Check CORS_ORIGIN in server config

## 📋 Benefits Over EmailJS

- ✅ **No size limits** - Send any PDF size
- ✅ **Reliable delivery** - Gmail's infrastructure
- ✅ **Professional appearance** - From admin's Gmail
- ✅ **No external dependencies** - Direct SMTP
- ✅ **Better error handling** - Server-side logging
- ✅ **Cost effective** - No EmailJS fees

## 🎯 Next Steps

1. **Start both servers** (backend + frontend)
2. **Test Gmail SMTP** connection
3. **Create job cards** to test real emails
4. **Verify PDF attachments** work correctly

The system now uses Gmail SMTP instead of EmailJS for reliable, unlimited PDF email delivery!
