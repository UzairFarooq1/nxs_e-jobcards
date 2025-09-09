# Google Drive Integration Setup Guide

This guide will help you set up Google Drive integration for the NXS E-JobCard system.

## Prerequisites

- Google account (it@vanguard-group.org)
- Access to Google Cloud Console

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project: "NXS E-JobCard System"
4. Click "Create"

## Step 2: Enable Google Drive API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Drive API"
3. Click on "Google Drive API" and click "Enable"

## Step 3: Create Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. Click "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized origins:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
7. Copy the Client ID

## Step 4: Configure the Application

1. Open `project/src/utils/driveStorageService.ts`
2. Replace the placeholder values:

```typescript
const config: DriveStorageConfig = {
  apiKey: 'your_actual_api_key_here',
  clientId: 'your_actual_client_id_here'
};
```

## Step 5: Test the Integration

1. Start the development server: `npm run dev`
2. Create a new job card
3. You should be prompted to authenticate with Google
4. After authentication, job cards will be saved to Google Drive

## Folder Structure

Job cards will be automatically organized in Google Drive:

```
Google Drive/
└── NXS Job Cards/
    ├── JobCard_JC-1234567890_Hospital_Name.json
    ├── JobCard_JC-1234567891_Another_Hospital.json
    └── ...
```

## Features

- **Automatic Backup**: All job cards are automatically saved to Google Drive
- **Organized Storage**: Files are organized in a dedicated "NXS Job Cards" folder
- **Fallback Support**: If Google Drive is unavailable, data is saved to localStorage
- **Real-time Sync**: Changes are immediately synced to Google Drive
- **Access Control**: Only authenticated users can access the job cards

## Security Notes

- API keys are client-side (consider using environment variables for production)
- Users must authenticate with their Google account
- Only the authenticated user can access their job cards
- Consider implementing server-side authentication for production use

## Troubleshooting

### Authentication Issues
- Ensure the OAuth client is configured correctly
- Check that authorized origins include your domain
- Verify the API key is correct

### Upload Issues
- Check browser console for error messages
- Ensure Google Drive API is enabled
- Verify user has sufficient Google Drive storage

### Performance Issues
- Large images may take time to upload
- Consider implementing image compression
- Monitor Google Drive API quotas

## Production Considerations

1. **Environment Variables**: Store API keys in environment variables
2. **Server-side Authentication**: Implement proper OAuth flow
3. **Error Handling**: Add comprehensive error handling
4. **Monitoring**: Set up monitoring for API usage
5. **Backup Strategy**: Implement additional backup mechanisms

## Support

For issues with Google Drive integration:
1. Check the browser console for error messages
2. Verify Google Cloud Console configuration
3. Test with a simple file upload first
4. Contact system administrator if issues persist

e ate 