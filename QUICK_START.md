# Quick Start: Gallery & Reviews Features

## 🚀 What's New

TrincoMate now includes:
1. **Gallery System** - Showcase Trincomalee tourist places with images
2. **Reviews System** - User testimonials with admin approval

## ⚡ Quick Setup (5 minutes)

### Step 1: Backend Running ✅
```bash
cd backend
npm start
# Should show: 🚀 Server running on port 5000
```

### Step 2: Frontend Running ✅
```bash
cd frontend
npm run dev
# Should show: http://localhost:5173 (or similar)
```

### Step 3: Deploy Firebase Security Rules ⚠️ IMPORTANT

Run these commands from project root:

```bash
# Install Firebase CLI (if not already)
npm install -g firebase-tools

# Login
firebase login

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

Or manually:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select TrincoMate project
3. **Firestore** > **Rules** > Paste content from `firebase/firestore-rules.txt`
4. **Storage** > **Rules** > Paste content from `firebase/storage-rules.txt`
5. Click **Publish** on both

## 📍 Where to Find Features

### For Users (Home Page)
1. **Gallery Section** - Scroll down to see "Trincomalee Tourist Places"
2. **Reviews Section** - Scroll further to see "Guest Reviews & Testimonials"

### For Admins (Admin Dashboard)
1. **Gallery Management** - `/admin/gallery`
2. **Reviews Management** - `/admin/reviews`

## 🎯 Admin Features

### Gallery Management
```
/admin/gallery
```
- ✅ View all gallery items
- ✅ Add new images (+ Add New Image button)
- ✅ Edit images
- ✅ Delete images
- ✅ See image count statistics

### Reviews Management
```
/admin/reviews
```
- ✅ View pending reviews (need approval)
- ✅ View approved reviews
- ✅ Approve reviews (publish them)
- ✅ Reject reviews (don't publish)
- ✅ Delete inappropriate reviews
- ✅ See statistics:
  - Total reviews count
  - Approved count
  - Pending count
  - Average rating

## 👥 User Features

### Submit a Review
1. Login (required)
2. Scroll to "Guest Reviews & Testimonials"
3. Select rating (1-5 stars)
4. Write review (minimum 10 characters)
5. Click "Submit Review"
6. Message: "Review submitted for approval"
7. Wait for admin to approve

### View Reviews
- See approved reviews with user names, dates, ratings
- See average rating at the top
- Newest reviews appear first

## 📱 Responsive Design

All features work on:
- ✅ Desktop (1920px and up)
- ✅ Laptop (1024px and up)
- ✅ Tablet (768px and up)
- ✅ Mobile (320px and up)

## 🔒 Security

- Gallery is **public read**, **admin write/delete**
- Reviews require **authentication** to submit
- Image uploads are **5MB max** and **image files only**
- Admin features protected by **role-based access**
- Firestore rules enforce **data validation**

## 📊 Real-time Updates

Changes appear instantly:
- Add gallery image → Shows immediately everywhere
- Approve review → Published instantly on home page
- Delete items → Removed from view instantly
- No page refresh needed!

## 🚨 Troubleshooting

### "Cannot add gallery images"
- Ensure you're logged in as admin
- Check security rules are deployed
- Check user role is "admin" in Firestore

### "Image upload fails"
- Image must be less than 5MB
- Image must be JPG, PNG, or WebP
- Check Firebase Storage quota

### "Reviews not showing"
- Reviews must be approved by admin first
- User must be logged in to see submit form
- Check Firestore listener is working

### "Real-time updates not working"
- Refresh page
- Check internet connection
- Check browser console for errors
- Verify Firestore security rules

## 📚 Full Documentation

See `GALLERY_AND_REVIEWS_GUIDE.md` for:
- Complete feature guide
- API documentation
- Security rules details
- Customization examples
- Performance tips
- Troubleshooting guide

## 🎨 File Locations

```
Frontend Components:
- Gallery: frontend/src/components/gallery/
- Reviews: frontend/src/components/reviews/
- Hooks: frontend/src/hooks/

Admin Pages:
- Gallery: frontend/src/pages/admin/AdminGallery.jsx
- Reviews: frontend/src/pages/admin/AdminReviews.jsx

Security Rules:
- Firestore: firebase/firestore-rules.txt
- Storage: firebase/storage-rules.txt
```

## ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running and accessible
- [ ] Firebase project initialized
- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed
- [ ] Gallery section visible on home page
- [ ] Reviews section visible on home page
- [ ] Admin can access `/admin/gallery`
- [ ] Admin can access `/admin/reviews`
- [ ] Admin can add gallery images
- [ ] Users can submit reviews
- [ ] Reviews need approval before showing
- [ ] Real-time updates working

## 🎉 You're All Set!

Everything is ready to go. Start adding gallery items and reviews to TrincoMate!

For detailed information, see `GALLERY_AND_REVIEWS_GUIDE.md`.
