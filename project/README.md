# NXS E-JobCard System

Electronic Job Card System for Nairobi X-ray Supplies Ltd - A comprehensive solution for managing service documentation and engineer workflows.

## Features

- **User Authentication**: Secure login with Supabase Auth
- **Role-based Access**: Admin and Engineer dashboards
- **Job Card Management**: Create, view, and manage service job cards
- **Image Capture**: Before/after service photos and facility stamps
- **Digital Signatures**: Canvas-based signature capture
- **PDF Generation**: Printable job card reports
- **Database Integration**: Supabase PostgreSQL database
- **Session Management**: 10-minute inactivity timeout with warnings
- **Facility Management**: Dynamic facility selection and creation

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **PDF Generation**: HTML to PDF conversion

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

## Setup Instructions

### 1. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL queries from `database-schema.sql` to create the required tables:

```sql
-- Run the complete schema from database-schema.sql
-- Or use quick-setup.sql for basic setup
```

### 2. Environment Configuration

The Supabase configuration is already set up in `src/config/supabase.ts` with your provided credentials.

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Default Credentials

### Admin Account
- **Email**: `it@vanguard-group.org`
- **Password**: `Vgc@admin2025!`

### Sample Engineer Accounts
- **Email**: `john.kamau@nairobiXraySupplies.com`
- **Password**: `password123`
- **Engineer ID**: `ENG-001`

- **Email**: `mary.wanjiku@nairobiXraySupplies.com`
- **Password**: `password123`
- **Engineer ID**: `ENG-002`

## Database Schema

### Engineers Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `engineer_id` (VARCHAR, Unique)
- `password` (VARCHAR)
- `created_at` (TIMESTAMP)

### Job Cards Table
- `id` (VARCHAR, Primary Key)
- `hospital_name` (VARCHAR)
- `facility_signature` (TEXT)
- `machine_type` (VARCHAR)
- `machine_model` (VARCHAR)
- `serial_number` (VARCHAR)
- `problem_reported` (TEXT)
- `service_performed` (TEXT)
- `engineer_name` (VARCHAR)
- `engineer_id` (VARCHAR)
- `date_time` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `status` (VARCHAR)
- `before_service_images` (TEXT[])
- `after_service_images` (TEXT[])
- `facility_stamp_image` (TEXT)

## Features Overview

### Admin Dashboard
- View all job cards across all engineers
- Search and filter job cards
- Bulk download job cards as PDFs
- Manage engineer accounts (add, edit, delete)
- View statistics and analytics

### Engineer Dashboard
- View personal job cards
- Create new job cards with:
  - Facility information
  - Machine details (type, model, serial number)
  - Service documentation
  - Before/after service photos
  - Facility stamp image
  - Digital signature capture
- Download job cards as PDFs

### Job Card Features
- **Dynamic Facility Selection**: Choose from existing facilities or create new ones
- **Image Capture**: Upload multiple before/after service photos
- **Facility Stamps**: Upload facility stamp images
- **Digital Signatures**: Canvas-based signature capture
- **PDF Generation**: Professional job card reports with all images and signatures

### Security Features
- **Session Management**: Automatic logout after 10 minutes of inactivity
- **Session Warnings**: 1-minute warning before logout
- **Row Level Security**: Database-level access control
- **Password Management**: Admin can update engineer passwords

## Project Structure

```
src/
├── components/
│   ├── AdminDashboard.tsx      # Admin interface
│   ├── EngineerDashboard.tsx   # Engineer interface
│   ├── JobCardForm.tsx         # Job card creation form
│   ├── LoginForm.tsx           # Authentication form
│   ├── Header.tsx              # Navigation header
│   ├── SignatureCanvas.tsx     # Signature capture component
│   ├── SessionManager.tsx      # Session management wrapper
│   └── SessionTimeoutWarning.tsx # Timeout warning modal
├── contexts/
│   ├── AuthContext.tsx         # Authentication state management
│   └── JobCardContext.tsx      # Job card state management
├── config/
│   └── supabase.ts             # Supabase configuration
├── utils/
│   ├── pdfGenerator.ts         # PDF generation utility
│   ├── inactivityManager.ts    # Session timeout management
│   └── driveStorageService.ts  # Google Drive integration (optional)
└── App.tsx                     # Main application component
```

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel/Netlify

1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

## Support

For technical support or questions, contact the development team.

## License

Proprietary - Nairobi X-ray Supplies Ltd