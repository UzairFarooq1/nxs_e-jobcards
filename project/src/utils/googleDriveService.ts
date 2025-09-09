import { JobCard } from '../contexts/JobCardContext';

// Google Drive API configuration
const GOOGLE_DRIVE_FOLDER_NAME = 'NXS Job Cards';
const GOOGLE_DRIVE_FOLDER_ID = 'your_folder_id_here'; // Will be set after folder creation

export interface GoogleDriveConfig {
  apiKey: string;
  clientId: string;
  discoveryDocs: string[];
  scopes: string;
}

// Default configuration - you'll need to replace these with your actual Google API credentials
const defaultConfig: GoogleDriveConfig = {
  apiKey: 'your_api_key_here',
  clientId: 'your_client_id_here',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
  scopes: 'https://www.googleapis.com/auth/drive.file'
};

class GoogleDriveService {
  private gapi: any = null;
  private isInitialized = false;
  private config: GoogleDriveConfig;

  constructor(config: GoogleDriveConfig = defaultConfig) {
    this.config = config;
  }

  // Initialize Google API
  async initialize(): Promise<boolean> {
    try {
      // Load Google API script if not already loaded
      if (!window.gapi) {
        await this.loadGoogleAPI();
      }

      this.gapi = window.gapi;
      
      // Initialize the API
      await this.gapi.load('client:auth2', async () => {
        await this.gapi.client.init({
          apiKey: this.config.apiKey,
          clientId: this.config.clientId,
          discoveryDocs: this.config.discoveryDocs,
          scope: this.config.scopes
        });
        
        this.isInitialized = true;
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize Google Drive API:', error);
      return false;
    }
  }

  // Load Google API script
  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  // Authenticate user
  async authenticate(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      return user.isSignedIn();
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  // Create NXS Job Cards folder if it doesn't exist
  async createJobCardsFolder(): Promise<string | null> {
    try {
      // Check if folder already exists
      const response = await this.gapi.client.drive.files.list({
        q: `name='${GOOGLE_DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)'
      });

      if (response.result.files && response.result.files.length > 0) {
        return response.result.files[0].id;
      }

      // Create new folder
      const folderMetadata = {
        name: GOOGLE_DRIVE_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder'
      };

      const folder = await this.gapi.client.drive.files.create({
        resource: folderMetadata,
        fields: 'id'
      });

      return folder.result.id;
    } catch (error) {
      console.error('Failed to create job cards folder:', error);
      return null;
    }
  }

  // Save job card to Google Drive
  async saveJobCard(jobCard: JobCard): Promise<boolean> {
    try {
      // Ensure user is authenticated
      const isAuthenticated = await this.authenticate();
      if (!isAuthenticated) {
        console.error('User not authenticated');
        return false;
      }

      // Get or create the job cards folder
      const folderId = await this.createJobCardsFolder();
      if (!folderId) {
        console.error('Failed to get job cards folder');
        return false;
      }

      // Create file metadata
      const fileName = `JobCard_${jobCard.id}_${jobCard.hospitalName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      const fileMetadata = {
        name: fileName,
        parents: [folderId]
      };

      // Convert job card to JSON
      const jobCardJson = JSON.stringify(jobCard, null, 2);
      const blob = new Blob([jobCardJson], { type: 'application/json' });

      // Upload file
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      form.append('file', blob);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`
        },
        body: form
      });

      if (response.ok) {
        console.log('Job card saved to Google Drive:', fileName);
        return true;
      } else {
        console.error('Failed to upload to Google Drive:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error saving job card to Google Drive:', error);
      return false;
    }
  }

  // Save job card PDF to Google Drive
  async saveJobCardPDF(jobCard: JobCard, pdfBlob: Blob): Promise<boolean> {
    try {
      // Ensure user is authenticated
      const isAuthenticated = await this.authenticate();
      if (!isAuthenticated) {
        console.error('User not authenticated');
        return false;
      }

      // Get or create the job cards folder
      const folderId = await this.createJobCardsFolder();
      if (!folderId) {
        console.error('Failed to get job cards folder');
        return false;
      }

      // Create file metadata
      const fileName = `JobCard_${jobCard.id}_${jobCard.hospitalName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const fileMetadata = {
        name: fileName,
        parents: [folderId]
      };

      // Upload PDF
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      form.append('file', pdfBlob);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`
        },
        body: form
      });

      if (response.ok) {
        console.log('Job card PDF saved to Google Drive:', fileName);
        return true;
      } else {
        console.error('Failed to upload PDF to Google Drive:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error saving job card PDF to Google Drive:', error);
      return false;
    }
  }

  // Get all job cards from Google Drive
  async getAllJobCards(): Promise<JobCard[]> {
    try {
      // Ensure user is authenticated
      const isAuthenticated = await this.authenticate();
      if (!isAuthenticated) {
        console.error('User not authenticated');
        return [];
      }

      // Get the job cards folder
      const folderId = await this.createJobCardsFolder();
      if (!folderId) {
        console.error('Failed to get job cards folder');
        return [];
      }

      // List all JSON files in the folder
      const response = await this.gapi.client.drive.files.list({
        q: `'${folderId}' in parents and mimeType='application/json'`,
        fields: 'files(id, name, modifiedTime)',
        orderBy: 'modifiedTime desc'
      });

      const jobCards: JobCard[] = [];

      if (response.result.files) {
        for (const file of response.result.files) {
          try {
            // Download file content
            const fileResponse = await this.gapi.client.drive.files.get({
              fileId: file.id,
              alt: 'media'
            });

            const jobCard = JSON.parse(fileResponse.body) as JobCard;
            jobCards.push(jobCard);
          } catch (error) {
            console.error(`Failed to load job card ${file.name}:`, error);
          }
        }
      }

      return jobCards;
    } catch (error) {
      console.error('Error loading job cards from Google Drive:', error);
      return [];
    }
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService();

// Helper function to check if Google Drive is available
export function isGoogleDriveAvailable(): boolean {
  return typeof window !== 'undefined' && window.gapi !== undefined;
}

// Helper function to initialize Google Drive service
export async function initializeGoogleDrive(): Promise<boolean> {
  return await googleDriveService.initialize();
}

