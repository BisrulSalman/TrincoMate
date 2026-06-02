# TrincoMate

TrincoMate is a modern, responsive tourism marketplace platform for Trincomalee, Sri Lanka.

This website helps travelers discover local hotels, tours, services, and activities in Trincomalee with multilingual support, live booking search, and a secure user dashboard for customers, owners, and administrators.

Owners can sign in to manage their listings, add new services, update availability and pricing, and view bookings from customers. This owner dashboard gives local businesses control over their offerings while the platform handles search and customer access.

Users can browse services, search by destination or category, save favorites, and book local experiences in their preferred language. The customer dashboard keeps booking history, personal details, and trip progress easy to access for a better travel planning experience.

## Folder Structure
```text
TrincoMate/
├── frontend/     # React + Vite frontend application
├── backend/      # Node.js + Express API server
└── firebase/     # Firebase configuration and admin guidelines
```

## Step-by-Step Setup Guide

Follow these commands in order to run the full stack locally.

### 1. Install repository dependencies

Open a terminal and install packages for both backend and frontend.

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 2. Configure environment variables

Create `.env` files in both `backend/` and `frontend/`.

#### Backend `.env`
Create `backend/.env` based on `backend/.env.example` and set:
- `PORT=5000`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_STORAGE_BUCKET`

If using `GOOGLE_APPLICATION_CREDENTIALS`, set that path instead.

#### Frontend `.env`
Create `frontend/.env` with at least:
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3. Start the backend server

In one terminal:
```bash
cd backend
npm run dev
```

The backend should start on:
- `http://localhost:5000`

Verify it is running by opening:
- `http://localhost:5000/api/health`

### 4. Start the frontend app

In a second terminal:
```bash
cd frontend
npm run dev
```

The frontend should be available at:
- `http://localhost:5173`

If port `5173` is already in use, Vite will choose the next available port.

### 5. Open the app in the browser

Visit the URL from Vite output. Example:
- `http://localhost:5173`

The frontend will request services from the backend at:
- `http://localhost:5000/api/services`

## Troubleshooting

- If the frontend shows:
  `Unable to load services. Please start the backend at http://localhost:5000 or set VITE_API_URL to the correct API endpoint.`
  - Confirm the backend is running.
  - Confirm `frontend/.env` has `VITE_API_URL=http://localhost:5000/api`.
  - Restart the frontend after changing `.env`.

- If the backend logs Firebase credential errors:
  - Ensure the Firebase credentials in `backend/.env` are correct.
  - Use `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_PRIVATE_KEY` settings properly.

## Useful Commands

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev

# Build frontend for production
cd frontend
npm run build
```

## Notes

- The frontend uses `VITE_API_URL` to find the backend API.
- The backend uses Firebase Admin to access Firestore and Storage.
- If you add or change environment values, restart the development servers.
"# TrincoMate" 
