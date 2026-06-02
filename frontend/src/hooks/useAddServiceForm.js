// ============================================================
//  useAddServiceForm.js  –  All form logic, validation, helpers
// ============================================================

import { useState, useCallback } from 'react';
import api from '../services/api';
import { auth } from '../firebase/config';

const STATUS_MAP = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  draft: 'Draft',
};

const normalizeStatus = (status) => {
  if (!status) return 'Pending';
  const key = String(status).trim().toLowerCase();
  return STATUS_MAP[key] || status;
};

// ─── Google Maps URL Parser (mock) ───────────────────────────
export function parseGoogleMapsUrl(url) {
  if (!url) return null;

  // Pattern 1: @lat,lng,zoom
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) return { lat: atMatch[1], lng: atMatch[2] };

  // Pattern 2: ?q=lat,lng
  const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) return { lat: qMatch[1], lng: qMatch[2] };

  // Pattern 3: /place/.../@lat,lng
  const placeMatch = url.match(/place\/[^/]+\/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (placeMatch) return { lat: placeMatch[1], lng: placeMatch[2] };

  // Pattern 4: ll=lat,lng
  const llMatch = url.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (llMatch) return { lat: llMatch[1], lng: llMatch[2] };

  // Fallback: mock coords for Trincomalee
  if (url.includes('google') && url.includes('map')) {
    return { lat: '8.5667', lng: '81.2333' };
  }

  return null;
}

// ─── Validators ───────────────────────────────────────────────
export function validateForm(form, { requireCoverImage = true } = {}) {
  const errors = {};

  if (!form.serviceName.trim()) errors.serviceName = 'Service name is required.';
  if (!form.category) errors.category = 'Please select a category.';
  if (!form.shortDescription.trim()) errors.shortDescription = 'Short description is required.';
  if (form.shortDescription.trim().length > 160)
    errors.shortDescription = 'Max 160 characters.';
  if (!form.fullDescription.trim()) errors.fullDescription = 'Full description is required.';
  if (!form.city) errors.city = 'City is required.';
  if (!form.address.trim()) errors.address = 'Address is required.';
  if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
    errors.price = 'Enter a valid price.';
  if (form.discount && (isNaN(form.discount) || form.discount < 0 || form.discount > 100))
    errors.discount = 'Discount must be 0–100.';
  if (form.googleMapUrl && !isValidGoogleMapUrl(form.googleMapUrl))
    errors.googleMapUrl = 'Please enter a valid Google Maps URL.';
  if (requireCoverImage && !form.coverImage) errors.coverImage = 'Cover image is required.';

  return errors;
}

function isValidGoogleMapUrl(url) {
  return (
    url.includes('google.com/maps') ||
    url.includes('goo.gl/maps') ||
    url.includes('maps.app.goo.gl')
  );
}

// ─── Initial State ────────────────────────────────────────────
const INITIAL_STATE = {
  // Basic
  serviceName: '',
  category: '',
  serviceType: '',
  shortDescription: '',
  fullDescription: '',
  // Location
  city: '',
  address: '',
  googleMapUrl: '',
  latitude: '',
  longitude: '',
  // Pricing
  price: '',
  priceType: 'per_night',
  discount: '',
  // Details
  facilities: [],
  capacity: '',
  openingHours: '08:00',
  closingHours: '22:00',
  // Booking
  availableForBooking: true,
  minBookingDays: 1,
  maxBookingDays: 30,
  // Status
  status: 'pending',
};

// ─── Hook ─────────────────────────────────────────────────────
export function useAddServiceForm({ serviceId = null, onSaved } = {}) {
  const [form, setForm]           = useState(INITIAL_STATE);
  const [errors, setErrors]       = useState({});
  const [mapParsed, setMapParsed] = useState(null);
  const [coverImage, setCoverImage]       = useState(null);   // { file, preview }
  const [showToast, setShowToast] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const ownerRequestConfig = () => (
     auth.currentUser || localStorage.getItem('authToken') ? { headers: {} } : { headers: { 'X-Demo-Owner': 'true' } }
  );

  // Generic field change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setForm(prev => ({ ...prev, [name]: val }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  // Facility toggle
  const toggleFacility = useCallback((id) => {
    setForm(prev => ({
      ...prev,
      facilities: prev.facilities.includes(id)
        ? prev.facilities.filter(f => f !== id)
        : [...prev.facilities, id],
    }));
  }, []);

  // Parse Google Maps URL
  const handleMapUrlChange = useCallback((e) => {
    const url = e.target.value;
    setForm(prev => ({ ...prev, googleMapUrl: url, latitude: '', longitude: '' }));
    setErrors(prev => ({ ...prev, googleMapUrl: undefined }));
    setMapParsed(null);

    if (url) {
      const coords = parseGoogleMapsUrl(url);
      if (coords) {
        setMapParsed(coords);
        setForm(prev => ({ ...prev, latitude: coords.lat, longitude: coords.lng }));
      } else if (url.length > 10) {
        setErrors(prev => ({ ...prev, googleMapUrl: 'Could not parse coordinates from this URL.' }));
      }
    }
  }, []);

  // Cover image
  const handleCoverImage = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, coverImage: 'Only image files are allowed.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, coverImage: 'Image must be under 5 MB.' }));
      return;
    }
    const preview = URL.createObjectURL(file);
    setCoverImage({ file, preview });
    setErrors(prev => ({ ...prev, coverImage: undefined }));
  }, []);

  const removeCoverImage = useCallback(() => {
    if (coverImage) URL.revokeObjectURL(coverImage.preview);
    setCoverImage(null);
  }, [coverImage]);

  // Gallery images removed — backend no longer accepts gallery uploads

  // Reset
  const handleReset = useCallback(() => {
    setForm(INITIAL_STATE);
    setErrors({});
    setMapParsed(null);
    setCoverImage(null);
    setGalleryImages([]);
  }, []);

  // Submit
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const formWithImages = { ...form, coverImage: coverImage?.file || coverImage?.preview || form.coverImage || null };
    const newErrors = validateForm(formWithImages, { requireCoverImage: !serviceId || !form.coverImage });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      const firstErrorEl = document.querySelector('.error-msg');
      if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    try {
      let response;

      if (serviceId) {
        // If new images were selected, send multipart/form-data to allow uploads
        const hasNewCover = !!(coverImage && coverImage.file);

        if (hasNewCover) {
          const formData = new FormData();
          Object.entries(form).forEach(([key, value]) => {
            if (key === 'facilities') {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value == null ? '' : value);
            }
          });
          // Append new cover image file
          if (hasNewCover) formData.append('coverImage', coverImage.file);

          response = await api.put(`/services/${serviceId}`, formData, {
            headers: ownerRequestConfig().headers || {}
          });
        } else {
          // No new files — send JSON update
          const updatePayload = { ...form };
          delete updatePayload.coverImage;
          response = await api.put(`/services/${serviceId}`, {
            ...updatePayload,
            facilities: form.facilities,
            status: normalizeStatus(form.status),
          }, ownerRequestConfig());
        }
      } else {
        const formData = new FormData();
        // Append text fields
        Object.entries(form).forEach(([key, value]) => {
          if (key === 'facilities') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, key === 'status' ? normalizeStatus(value) : value);
          }
        });
        // Append cover image
        if (coverImage?.file) {
          formData.append('coverImage', coverImage.file);
        }
        // Gallery images ignored — backend no longer accepts gallery uploads

        response = await api.post('/services', formData, {
          headers: ownerRequestConfig().headers || {}
        });
      }
      
      console.log(serviceId ? 'Service updated:' : 'Service created:', response.data);
      // Notify other parts of the app to refresh service lists
      try { window.dispatchEvent(new Event('servicesUpdated')); } catch { /* ignore */ }
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        if (onSaved) {
          onSaved(response.data);
        } else {
          handleReset();
        }
      }, 3500);
    } catch (error) {
      console.error('Error adding service:', error);
      alert(error.response?.data?.error || 'Failed to add service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, coverImage, galleryImages, handleReset, onSaved, serviceId]);

  return {
    form, errors, mapParsed, coverImage, galleryImages, showToast, isSubmitting,
    handleChange, toggleFacility, handleMapUrlChange,
    handleCoverImage, removeCoverImage,
    // gallery handlers removed
    handleSubmit, handleReset,
    setForm, setCoverImage,
  };
}
