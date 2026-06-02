# Firebase Configuration & Setup

This directory is intended to store any necessary Firebase configuration details or service account keys.

## Admin SDK Setup (Backend)
To allow the Node.js backend to securely access your Firestore database, it must authenticate as an Admin.

### Option 1: Use a Service Account JSON (Recommended for Local Dev)
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. Go to **Project Settings** > **Service Accounts**.
4. Click **Generate new private key** and download the JSON file.
5. Place the downloaded JSON file in the `backend/config/` directory (e.g., `serviceAccountKey.json`).
6. Update the `backend/.env` file:
   `GOOGLE_APPLICATION_CREDENTIALS=./config/serviceAccountKey.json`

### Option 2: Inline Environment Variables (Recommended for Production/Vercel)
Instead of a file, you can provide the credentials directly via environment variables in `backend/.env`:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

*Note: Ensure your `FIREBASE_PRIVATE_KEY` has standard newline characters encoded as `\n` in the `.env` file.*

## Collections Overview
The backend API interacts with the following Firestore collections:
- `users`: User profiles and authentication details
- `owners`: Tourism business owner profiles
- `services`: Published and draft tourism services
- `bookings`: Reservations made by users for specific services
- `categories`: Available tourism categories
