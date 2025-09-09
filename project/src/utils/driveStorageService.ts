// Google Drive Storage Service
// This service handles saving and loading job cards to/from Google Drive

const GOOGLE_DRIVE_FOLDER_NAME = 'NXS Job Cards';
const GOOGLE_DRIVE_FOLDER_ID_KEY = 'nxs-drive-folder-id';

let gapi: any = null;
let isInitialized = false;

// Initialize Google Drive API
export async function initializeDriveStorage(): Promise<boolean> {
  try {
    // Load Google API script
    if (!window.gapi) {
      await loadGoogleAPI();
    }

    gapi = window.gapi;
    
    // Initialize the client
    await gapi.load('client:auth2', async () => {
      await gapi.client.init({
        apiKey: 'YOUR_API_KEY', // Replace with actual API key
        clientId: 'YOUR_CLIENT_ID', // Replace with actual client ID
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        scope: 'https://www.googleapis.com/auth/drive.file'
      });
    });

    // Check if user is already signed in
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
      // Sign in the user
      await authInstance.signIn();
    }

    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize Google Drive:', error);
    return false;
  }
}

// Load Google API script
function loadGoogleAPI(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.gapi) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google API'));
    document.head.appendChild(script);
  });
}

// Get or create the job cards folder
async function getOrCreateJobCardsFolder(): Promise<string> {
  try {
    // Check if folder already exists in localStorage
    const existingFolderId = localStorage.getItem(GOOGLE_DRIVE_FOLDER_ID_KEY);
    if (existingFolderId) {
      // Verify folder still exists
      try {
        await gapi.client.drive.files.get({
          fileId: existingFolderId,
          fields: 'id,name'
        });
        return existingFolderId;
      } catch (error) {
        // Folder doesn't exist, remove from localStorage
        localStorage.removeItem(GOOGLE_DRIVE_FOLDER_ID_KEY);
      }
    }

    // Search for existing folder
    const response = await gapi.client.drive.files.list({
      q: `name='${GOOGLE_DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id,name)'
    });

    if (response.result.files && response.result.files.length > 0) {
      const folderId = response.result.files[0].id;
      localStorage.setItem(GOOGLE_DRIVE_FOLDER_ID_KEY, folderId);
      return folderId;
    }

    // Create new folder
    const createResponse = await gapi.client.drive.files.create({
      resource: {
        name: GOOGLE_DRIVE_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder'
      },
      fields: 'id'
    });

    const folderId = createResponse.result.id;
    localStorage.setItem(GOOGLE_DRIVE_FOLDER_ID_KEY, folderId);
    return folderId;
  } catch (error) {
    console.error('Failed to get or create folder:', error);
    throw error;
  }
}

// Save a job card to Google Drive
export async function saveJobCardToDrive(jobCard: any): Promise<boolean> {
  try {
    if (!isInitialized) {
      throw new Error('Google Drive not initialized');
    }

    const folderId = await getOrCreateJobCardsFolder();
    
    // Convert job card to JSON
    const jobCardJson = JSON.stringify(jobCard, null, 2);
    const blob = new Blob([jobCardJson], { type: 'application/json' });
    
    // Create file metadata
    const metadata = {
      name: `jobcard-${jobCard.id}.json`,
      parents: [folderId]
    };

    // Create form data
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    // Upload file
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`
      },
      body: form
    });

    if (response.ok) {
      console.log('Job card saved to Google Drive:', jobCard.id);
      return true;
    } else {
      throw new Error(`Failed to upload: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to save job card to Drive:', error);
    return false;
  }
}

// Load all job cards from Google Drive
export async function loadJobCardsFromDrive(): Promise<any[]> {
  try {
    if (!isInitialized) {
      throw new Error('Google Drive not initialized');
    }

    const folderId = await getOrCreateJobCardsFolder();
    
    // List files in the folder
    const response = await gapi.client.drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/json' and trashed=false`,
      fields: 'files(id,name)'
    });

    if (!response.result.files || response.result.files.length === 0) {
      return [];
    }

    // Load each job card file
    const jobCards = [];
    for (const file of response.result.files) {
      try {
        const fileResponse = await gapi.client.drive.files.get({
          fileId: file.id,
          alt: 'media'
        });
        
        const jobCard = JSON.parse(fileResponse.body);
        jobCards.push(jobCard);
      } catch (error) {
        console.error(`Failed to load job card ${file.name}:`, error);
      }
    }

    return jobCards;
  } catch (error) {
    console.error('Failed to load job cards from Drive:', error);
    return [];
  }
}

// Check if Google Drive is available
export function isDriveAvailable(): boolean {
  return isInitialized;
}