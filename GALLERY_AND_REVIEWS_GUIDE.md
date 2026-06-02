# TrincoMate Gallery & Reviews Feature Guide

## Overview
This guide covers the complete implementation of two new features for TrincoMate:
1. **Gallery System** - Admin can manage tourist place gallery with images
2. **Reviews System** - Users can submit reviews, admins can approve/manage them

---

## Table of Contents
1. [Feature Overview](#feature-overview)
2. [Installation & Setup](#installation--setup)
3. [Gallery Feature](#gallery-feature)
4. [Reviews Feature](#reviews-feature)
5. [Admin Panel](#admin-panel)
6. [Security Rules](#security-rules)
7. [Firebase Collections Structure](#firebase-collections-structure)
8. [API Endpoints](#api-endpoints)
9. [Troubleshooting](#troubleshooting)

---

## Feature Overview

### Gallery System
- **Public View**: Responsive gallery grid showing all tourist places
- **Admin Management**: Add, edit, delete gallery items with image uploads
- **Images**: Stored in Firebase Storage with Firestore metadata
- **Real-time Updates**: Changes reflect immediately across the app

### Reviews System
- **User Submissions**: Authenticated users can submit reviews after login
- **Rating System**: 1-5 star ratings with visual display
- **Approval Workflow**: Admin approves/rejects reviews before publishing
- **Average Rating**: Automatic calculation from approved reviews
- **Public Display**: Shows latest approved reviews first

---

## Installation & Setup

### 1. Ensure Backend is Running
```bash
cd backend
npm start
```
Backend should be running on `http://localhost:5000`

### 2. Ensure Frontend is Running
```bash
cd frontend
npm install
npm run dev
```

### 3. Firebase Configuration
The app already uses Firebase for authentication and storage. Verify the config file exists:
- `frontend/src/firebase/config.js` - Contains Firebase configuration

### 4. Database Collections
Create these Firestore collections (they'll auto-create with first document):
- `gallery` - Stores gallery items
- `reviews` - Stores user reviews

### 5. Deploy Security Rules
See [Security Rules](#security-rules) section below.

---

## Gallery Feature

### Components

#### GallerySection (Public View)
**Location**: `frontend/src/components/gallery/GallerySection.jsx`

Displays gallery on the home page. Responsive grid layout with:
- Place name
- Description
- Beautiful image with hover effects
- Loading states and error handling

**Usage**:
```jsx
import GallerySection from './components/gallery/GallerySection';

<GallerySection />
```

#### GalleryGrid
**Location**: `frontend/src/components/gallery/GalleryGrid.jsx`

Reusable grid component that displays gallery items.
- Shows edit/delete buttons for admins only
- Responsive for all screen sizes
- Beautiful hover animations

#### GalleryModal
**Location**: `frontend/src/components/gallery/GalleryModal.jsx`

Modal form for adding/editing gallery items:
- Place name input
- Description textarea
- Image upload with preview
- Form validation
- File size validation (max 5MB)
- Image type validation

### Admin Page

#### AdminGallery
**Location**: `frontend/src/pages/admin/AdminGallery.jsx`

Admin dashboard for gallery management:
- View all gallery items
- Add new gallery items
- Edit existing items
- Delete items with confirmation
- Real-time updates
- Success/error messages
- Statistics (total images count)

**Accessing**:
1. Navigate to `/admin`
2. Click "Gallery Management" in sidebar
3. Use "+ Add New Image" button

### Hook: useGallery
**Location**: `frontend/src/hooks/useGallery.js`

Custom React hook managing all gallery operations:

```javascript
const {
  gallery,           // Array of gallery items
  loading,          // Loading state
  error,            // Error message
  addGalleryItem,   // Function to add new item
  updateGalleryItem, // Function to update item
  deleteGalleryItem  // Function to delete item
} = useGallery();
```

**Methods**:
```javascript
// Add gallery item
await addGalleryItem(placeName, description, imageFile);

// Update gallery item
await updateGalleryItem(id, placeName, description, imageFile);

// Delete gallery item
await deleteGalleryItem(id, imageUrl);
```

---

## Reviews Feature

### Components

#### ReviewsSection (Public View)
**Location**: `frontend/src/components/reviews/ReviewsSection.jsx`

Displays reviews on home page with:
- Average rating with stars
- Review submission form (for authenticated users)
- List of approved reviews
- Latest reviews first
- Real-time updates

#### ReviewForm
**Location**: `frontend/src/components/reviews/ReviewForm.jsx`

Form for submitting reviews:
- Star rating selector (1-5)
- Review text textarea (min 10 chars)
- Character counter
- Login prompt for non-authenticated users
- Validation and error messages
- Success feedback

#### ReviewCard
**Location**: `frontend/src/components/reviews/ReviewCard.jsx`

Individual review card component:
- User name and date
- Star rating display
- Review text
- Admin action buttons (approve, reject, delete)
- Pending badge for unapproved reviews
- Responsive design

### Admin Page

#### AdminReviews
**Location**: `frontend/src/pages/admin/AdminReviews.jsx`

Admin dashboard for review management:
- View all reviews (pending and approved)
- Approve reviews
- Reject reviews
- Delete inappropriate reviews
- Statistics dashboard:
  - Total reviews count
  - Approved reviews count
  - Pending approval count
  - Average rating
- Real-time updates

**Accessing**:
1. Navigate to `/admin`
2. Click "Manage Reviews" in sidebar
3. See pending reviews section with action buttons

### Hook: useReviews
**Location**: `frontend/src/hooks/useReviews.js`

Custom React hook managing all review operations:

```javascript
const {
  reviews,           // All reviews
  approvedReviews,   // Only approved reviews
  averageRating,     // Calculated average rating
  loading,          // Loading state
  error,            // Error message
  addReview,        // Submit new review
  approveReview,    // Admin approve
  rejectReview,     // Admin reject
  deleteReview      // Admin delete
} = useReviews();
```

**Methods**:
```javascript
// Submit review (authenticated users only)
await addReview(userId, userName, rating, reviewText);

// Approve review (admin only)
await approveReview(id);

// Reject review (admin only)
await rejectReview(id);

// Delete review (admin only)
await deleteReview(id);
```

---

## Admin Panel

### Gallery Management
**Path**: `/admin/gallery`

Features:
- ✅ View all gallery items in grid
- ✅ Add new images with details
- ✅ Edit existing items
- ✅ Delete images with confirmation
- ✅ Real-time updates
- ✅ Success/error notifications

### Reviews Management
**Path**: `/admin/reviews`

Features:
- ✅ View pending reviews awaiting approval
- ✅ View approved reviews
- ✅ Approve reviews to publish
- ✅ Reject reviews without publishing
- ✅ Delete inappropriate reviews
- ✅ Statistics dashboard
- ✅ Average rating calculation

---

## Security Rules

### Firestore Security Rules

**File**: `firebase/firestore-rules.txt`

#### Gallery Collection Rules
```
- Read: Everyone (public)
- Create: Admin only
- Update: Admin only
- Delete: Admin only
```

#### Reviews Collection Rules
```
- Read: Everyone for approved reviews, Admin for all
- Create: Authenticated users (with validation)
- Update: Admin only (approval/rejection)
- Delete: Admin only
```

### Storage Rules

**File**: `firebase/storage-rules.txt`

#### Gallery Images
```
- Read: Everyone (public)
- Write: Admin only
- Delete: Admin only
- Size limit: 5MB per image
- Type: Image files only
```

### Deploying Rules

#### Using Firebase CLI:

1. Install Firebase CLI (if not already installed):
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init
```

4. Deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```

Content of rules (from `firebase/firestore-rules.txt`) goes into:
- Firebase Console > Firestore > Rules tab, OR
- In `firestore.rules` file in your project root

5. Deploy Storage rules:
```bash
firebase deploy --only storage
```

Content of rules (from `firebase/storage-rules.txt`) goes into:
- Firebase Console > Storage > Rules tab, OR
- In `storage.rules` file in your project root

#### Using Firebase Console (Web):

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your TrincoMate project
3. Go to **Firestore Database** > **Rules**
4. Copy content from `firebase/firestore-rules.txt`
5. Click **Publish**
6. Go to **Storage** > **Rules**
7. Copy content from `firebase/storage-rules.txt`
8. Click **Publish**

---

## Firebase Collections Structure

### Gallery Collection

**Collection**: `gallery`

**Document Structure**:
```json
{
  "id": "auto-generated",
  "placeName": "Trincomalee Beach",
  "description": "Beautiful sandy beach with clear waters",
  "imageUrl": "https://storage.googleapis.com/...",
  "createdAt": Timestamp(2024, 6, 1, 10, 30, 0)
}
```

### Reviews Collection

**Collection**: `reviews`

**Document Structure**:
```json
{
  "id": "auto-generated",
  "userId": "firebase-user-id",
  "userName": "John Doe",
  "rating": 5,
  "reviewText": "Amazing experience! Highly recommended.",
  "approved": true,
  "createdAt": Timestamp(2024, 6, 1, 10, 30, 0)
}
```

---

## API Endpoints

### Gallery API (Frontend)

All operations use the `useGallery` hook. No direct API calls needed from components.

**Hook handles**:
- Real-time listening to Firestore changes
- Image upload to Storage
- Metadata storage in Firestore
- Error handling and loading states

### Reviews API (Frontend)

All operations use the `useReviews` hook. No direct API calls needed from components.

**Hook handles**:
- Real-time listening to Firestore changes
- Review submission
- Approval/rejection workflow
- User authentication checks
- Average rating calculation

---

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── gallery/
│   │   │   ├── GalleryGrid.jsx
│   │   │   ├── GalleryGrid.css
│   │   │   ├── GalleryModal.jsx
│   │   │   ├── GalleryModal.css
│   │   │   ├── GallerySection.jsx
│   │   │   └── GallerySection.css
│   │   └── reviews/
│   │       ├── ReviewCard.jsx
│   │       ├── ReviewCard.css
│   │       ├── ReviewForm.jsx
│   │       ├── ReviewForm.css
│   │       ├── ReviewsSection.jsx
│   │       └── ReviewsSection.css
│   ├── hooks/
│   │   ├── useGallery.js
│   │   └── useReviews.js
│   └── pages/
│       ├── admin/
│       │   ├── AdminGallery.jsx
│       │   ├── AdminGallery.css
│       │   ├── AdminReviews.jsx
│       │   └── AdminReviews.css
│       └── public/
│           └── Home.jsx (updated)
│
firebase/
├── firestore-rules.txt
└── storage-rules.txt
```

---

## Usage Examples

### Adding Gallery Item (Admin)

1. Go to `/admin/gallery`
2. Click "+ Add New Image"
3. Fill in:
   - Place Name: "Lover's Leap"
   - Description: "Scenic viewpoint..."
   - Choose image file
4. Click "Save"
5. Gallery updates in real-time

### Submitting Review (User)

1. Go to home page (automatically scrolls to reviews section)
2. Login if not already logged in
3. Select rating (1-5 stars)
4. Write review (min 10 characters)
5. Click "Submit Review"
6. Message shows "Under Admin Approval"

### Approving Reviews (Admin)

1. Go to `/admin/reviews`
2. See "Pending Approval" section
3. Click "✓ Approve" or "✕ Reject"
4. Reviews instantly move to approved section
5. Published on home page in real-time

---

## Real-time Features

Both features use Firestore's real-time listeners via `onSnapshot`:

- **Gallery changes**: Immediately visible on all pages
- **Review approvals**: Instantly appear on home page
- **No page refresh needed**: Changes appear in real-time
- **Handles offline**: Firestore offline persistence enabled by default

---

## Error Handling

### Common Errors & Solutions

**"Unable to load gallery"**
- Check Firestore security rules
- Ensure Firebase configuration is correct
- Verify Internet connection

**"Failed to upload image"**
- Image file size > 5MB (reduce image size)
- Invalid image format (use JPG, PNG, WebP)
- Check Storage security rules
- Check Firebase storage quota

**"Cannot submit review"**
- Must be logged in
- Review text must be at least 10 characters
- Check Firestore security rules

**"Admin features not working"**
- User role must be "admin" in Firestore
- Security rules must allow admin operations
- Check custom claims are set correctly

---

## Performance Optimization

### Image Optimization
- Images are stored in Firebase Storage
- Firestore stores only the URL reference
- Use responsive image loading (lazy loading enabled)

### Real-time Listeners
- Firestore listeners are attached in useEffect cleanup
- Listeners automatically unsubscribe when components unmount
- No memory leaks or duplicate listeners

### Pagination
- Currently loads all items
- For large datasets, implement pagination in hooks
- Example: Add `limit(10)` to Firestore queries

---

## Customization Guide

### Changing Star Ratings Appearance
**File**: `ReviewCard.jsx` or `ReviewForm.jsx`

```javascript
const renderStars = (rating) => {
  return (
    <div className="stars">
      {Array(5).fill(0).map((_, i) => (
        <span key={i} className={`star ${i < rating ? 'filled' : 'empty'}`}>
          ★  {/* Change this character */}
        </span>
      ))}
    </div>
  );
};
```

### Changing Colors
**Files**: `*.css` files in components

Key color variables:
- Primary blue: `#3498db`
- Success green: `#27ae60`
- Warning orange: `#f39c12`
- Error red: `#e74c3c`

### Changing Validation Rules
**Files**: `useGallery.js`, `useReviews.js`, Component files

Example - Change minimum review length:
```javascript
if (formData.reviewText.trim().length < 20) {  // Changed from 10
  setError('Review must be at least 20 characters long');
  return;
}
```

---

## Troubleshooting

### Reviews not updating in real-time
1. Check Firestore listener is attached
2. Verify `onSnapshot` is working
3. Check browser console for errors
4. Refresh page if stuck

### Admin buttons not showing
1. Verify user role is "admin" in Firestore `users` collection
2. Check `isAdmin()` function in components
3. Verify `auth.currentUser` is set
4. Check localStorage `authUser` has role="admin"

### Images not uploading
1. Check image size (max 5MB)
2. Verify image format (JPG, PNG, WebP)
3. Check Firebase Storage security rules
4. Verify Storage bucket exists and is accessible

### Firestore queries slow
1. Check indexes are created (Firebase will prompt)
2. Verify network connection
3. Check quota usage in Firebase Console
4. Optimize Firestore queries with limits

---

## Next Steps & Enhancements

### Possible Improvements
1. **Image Compression**: Compress images before upload
2. **Pagination**: Add pagination for large datasets
3. **Search**: Search reviews and gallery items
4. **Filtering**: Filter reviews by rating
5. **Image Optimization**: Use WebP format, lazy loading
6. **Email Notifications**: Notify admins of new reviews
7. **Photo Moderation**: AI-powered inappropriate image detection
8. **Comments on Reviews**: Allow reply comments
9. **Review Voting**: Like/helpful review system
10. **Analytics**: Track gallery views and review metrics

---

## Support & Contact

For issues or questions:
1. Check browser console for errors
2. Review Firebase logs
3. Verify security rules are deployed
4. Check all environment variables are set
5. Ensure backend is running

---

## Version History

- **v1.0** (June 1, 2024)
  - Initial gallery feature
  - Initial reviews feature
  - Admin panel integration
  - Firestore & Storage rules
  - Real-time updates
  - Responsive design
  - Mobile optimization

---

## License
This code is part of TrincoMate project.
