import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams }  from 'react-router-dom';
import {
  ArrowLeft, Layers, MapPin, DollarSign, Settings2,
  Image as ImageIcon, CalendarCheck, CheckCircle2,
  AlertCircle, X, ExternalLink, Check, Send, RotateCcw,
} from 'lucide-react';

import './addService.css';
import BackButton from '../../components/layout/BackButton';
import { serviceCategories, facilitiesList, priceTypes, citiesList } from '../../data/addServiceData';
import { useAddServiceForm } from '../../hooks/useAddServiceForm';
import api from '../../services/api';

// ─── Small helpers ────────────────────────────────────────────
const Field = ({ label, required, error, children }) => (
  <div className="form-field">
    <label>{label} {required && <span className="required">*</span>}</label>
    {children}
    {error && <span className="error-msg"><AlertCircle size={13} />{error}</span>}
  </div>
);

const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="form-section-header">
    <div className="section-icon">{icon}</div>
    <div>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────
const normalizeStatus = (status) => {
  const lower = String(status || '').trim().toLowerCase();
  if (lower === 'pending') return 'Pending';
  if (lower === 'approved') return 'Approved';
  if (lower === 'rejected') return 'Rejected';
  if (lower === 'draft') return 'Draft';
  return status;
};

const AddService = () => {
  const { id: editServiceId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(editServiceId);
  const [categoryOptions, setCategoryOptions] = useState(serviceCategories);
  const {
    form, errors, mapParsed, coverImage, galleryImages, showToast, isSubmitting,
    handleChange, toggleFacility, handleMapUrlChange,
    handleCoverImage, removeCoverImage,
    handleGalleryImages, removeGalleryImage,
    handleSubmit, handleReset, setForm, setCoverImage,
  } = useAddServiceForm({
    serviceId: editServiceId,
    onSaved: () => navigate('/owner/services'),
  });

  useEffect(() => {
    api.get('/categories')
      .then(res => {
        const backendCategories = res.data.categories || [];
        if (!backendCategories.length) return;

        const mergedCategories = backendCategories.map(category => {
          const existingCategory = serviceCategories.find(c => c.name === category.name);
          return {
            ...category,
            types: existingCategory?.types || ['Standard Service'],
          };
        });

        setCategoryOptions(mergedCategories);
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
      });
  }, []);

  useEffect(() => {
    if (!editServiceId) return;

    api.get(`/services/${editServiceId}`)
      .then(res => {
        const service = res.data.service;
        setForm(prev => ({
          ...prev,
          serviceName: service.serviceName || '',
          category: service.category || '',
          serviceType: service.serviceType || '',
          shortDescription: service.shortDescription || '',
          fullDescription: service.fullDescription || '',
          city: service.city || '',
          address: service.address || '',
          googleMapUrl: service.googleMapUrl || '',
          latitude: service.latitude || '',
          longitude: service.longitude || '',
          price: service.price || '',
          priceType: service.priceType || 'per_night',
          discount: service.discount || '',
          facilities: Array.isArray(service.facilities) ? service.facilities : [],
          capacity: service.capacity || '',
          openingHours: service.openingHours || '08:00',
          closingHours: service.closingHours || '22:00',
          availableForBooking: service.availableForBooking === undefined
            ? true
            : service.availableForBooking === true || service.availableForBooking === 'true',
          minBookingDays: service.minBookingDays || 1,
          maxBookingDays: service.maxBookingDays || 30,
          status: normalizeStatus(service.status || 'pending'),
          coverImage: service.coverImage || '',
        }));

        if (service.coverImage) {
          setCoverImage({ file: null, preview: service.coverImage });
        }
      })
      .catch(err => {
        console.error('Error loading service for edit:', err);
        alert(err.response?.data?.error || 'Failed to load service for editing.');
        navigate('/owner/services');
      });
  }, [editServiceId, navigate, setCoverImage, setForm]);

  const selectedCategory = categoryOptions.find(c => c.name === form.category);

  return (
    <div className="add-service-page animate-fade-in">

      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BackButton fallback="/owner/services" />
          <div className="icon-wrap"><Layers size={26} /></div>
        </div>
        <div>
          <h1>{isEditMode ? 'Edit Service' : 'Add New Service'}</h1>
          <p>{isEditMode ? 'Update your service details. Saved edits return to admin for approval.' : 'Fill in the details below to list your tourism service on TrincoMate.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>

        {/* ══════ SECTION 1 — BASIC INFORMATION ══════ */}
        <div className="form-section">
          <SectionHeader
            icon={<Settings2 size={20} />}
            title="Basic Information"
            subtitle="General details about your service"
          />
          <div className="form-grid-2">
            <Field label="Service Name" required error={errors.serviceName}>
              <input
                name="serviceName" value={form.serviceName}
                onChange={handleChange} className={errors.serviceName ? 'error' : ''}
                placeholder="e.g. Sunset Beach Resort"
              />
            </Field>

            <Field label="Category" required error={errors.category}>
              <select
                name="category" value={form.category}
                onChange={handleChange} className={errors.category ? 'error' : ''}
              >
                <option value="">-- Select Category --</option>
                {categoryOptions.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Service Type" error={errors.serviceType}>
              <select
                name="serviceType" value={form.serviceType}
                onChange={handleChange}
                disabled={!selectedCategory}
              >
                <option value="">
                  {selectedCategory ? '-- Select Type --' : 'Select a category first'}
                </option>
                {selectedCategory?.types.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>

            <Field label="Short Description (max 160 chars)" required error={errors.shortDescription}>
              <input
                name="shortDescription" value={form.shortDescription}
                onChange={handleChange} className={errors.shortDescription ? 'error' : ''}
                placeholder="One-line summary shown in listings"
                maxLength={160}
              />
              <span style={{ fontSize: '12px', color: form.shortDescription.length > 140 ? '#f59e0b' : '#94a3b8' }}>
                {form.shortDescription.length}/160
              </span>
            </Field>

            <div className="col-span-2">
              <Field label="Full Description" required error={errors.fullDescription}>
                <textarea
                  name="fullDescription" value={form.fullDescription}
                  onChange={handleChange} className={errors.fullDescription ? 'error' : ''}
                  rows={5} placeholder="Describe your service in detail — what makes it special, what guests can expect..."
                />
              </Field>
            </div>
          </div>
        </div>

        {/* ══════ SECTION 2 — LOCATION ══════ */}
        <div className="form-section">
          <SectionHeader
            icon={<MapPin size={20} />}
            title="Location Information"
            subtitle="Help tourists find you easily"
          />
          <div className="form-grid-2">
            <Field label="City / Town" required error={errors.city}>
              <select
                name="city" value={form.city}
                onChange={handleChange} className={errors.city ? 'error' : ''}
              >
                <option value="">-- Select City --</option>
                {citiesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Street Address" required error={errors.address}>
              <input
                name="address" value={form.address}
                onChange={handleChange} className={errors.address ? 'error' : ''}
                placeholder="e.g. 12 Beach Road, Uppuveli"
              />
            </Field>

            <div className="col-span-2">
              <Field label="Google Maps URL" error={errors.googleMapUrl}>
                <input
                  name="googleMapUrl" value={form.googleMapUrl}
                  onChange={handleMapUrlChange}
                  className={errors.googleMapUrl ? 'error' : ''}
                  placeholder="Paste your Google Maps link here..."
                />
              </Field>

              {/* Map Preview Card */}
              {mapParsed && (
                <div className="map-preview-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontWeight: '600' }}>
                    <CheckCircle2 size={18} /> Location Detected
                  </div>
                  <div className="map-coords">
                    <span className="coord-badge">🌐 Lat: {form.latitude}</span>
                    <span className="coord-badge">🌐 Lng: {form.longitude}</span>
                  </div>
                  <div
                    className="map-placeholder"
                    style={{ background: 'linear-gradient(135deg,#bfdbfe,#dbeafe)', color: '#1d4ed8' }}
                  >
                    <MapPin size={32} />
                    <span style={{ fontWeight: '600' }}>{form.city || 'Location'}</span>
                    <span style={{ fontSize: '12px' }}>{form.latitude}, {form.longitude}</span>
                  </div>
                  <a
                    href={form.googleMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-view-btn"
                  >
                    <ExternalLink size={15} /> View on Google Maps
                  </a>
                </div>
              )}

              {!mapParsed && (
                <div className="map-placeholder">
                  <MapPin size={28} />
                  <span>Map preview will appear after a valid Google Maps URL is pasted</span>
                </div>
              )}
            </div>

            <Field label="Latitude" error={errors.latitude}>
              <input
                name="latitude" value={form.latitude}
                onChange={handleChange}
                placeholder="e.g. 8.5667"
              />
            </Field>

            <Field label="Longitude" error={errors.longitude}>
              <input
                name="longitude" value={form.longitude}
                onChange={handleChange}
                placeholder="e.g. 81.2333"
              />
            </Field>
          </div>
        </div>

        {/* ══════ SECTION 3 — PRICING ══════ */}
        <div className="form-section">
          <SectionHeader
            icon={<DollarSign size={20} />}
            title="Pricing Information"
            subtitle="Set your rate and optional discount"
          />
          <div className="form-grid-3">
            <Field label="Price (USD)" required error={errors.price}>
              <input
                name="price" type="number" min="0" step="0.01"
                value={form.price} onChange={handleChange}
                className={errors.price ? 'error' : ''}
                placeholder="e.g. 50"
              />
            </Field>

            <Field label="Price Type" required error={errors.priceType}>
              <select name="priceType" value={form.priceType} onChange={handleChange}>
                {priceTypes.map(pt => (
                  <option key={pt.value} value={pt.value}>{pt.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Discount (%)" error={errors.discount}>
              <input
                name="discount" type="number" min="0" max="100"
                value={form.discount} onChange={handleChange}
                className={errors.discount ? 'error' : ''}
                placeholder="0–100"
              />
            </Field>

            {/* Price summary */}
            {form.price && (
              <div className="col-span-3" style={{
                background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
                border: '1.5px solid #86efac', borderRadius: '12px',
                padding: '16px 20px', display: 'flex', gap: '30px', flexWrap: 'wrap'
              }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#166534', marginBottom: '4px', fontWeight: '600' }}>Base Price</p>
                  <p style={{ fontSize: '22px', fontWeight: '700', color: '#15803d' }}>
                    ${Number(form.price).toFixed(2)}
                    <span style={{ fontSize: '14px', fontWeight: '400', color: '#166534' }}>
                      {' '}/ {priceTypes.find(p => p.value === form.priceType)?.label}
                    </span>
                  </p>
                </div>
                {form.discount > 0 && (
                  <div>
                    <p style={{ fontSize: '12px', color: '#166534', marginBottom: '4px', fontWeight: '600' }}>After Discount</p>
                    <p style={{ fontSize: '22px', fontWeight: '700', color: '#15803d' }}>
                      ${(form.price * (1 - form.discount / 100)).toFixed(2)}
                      <span style={{ fontSize: '13px', color: '#16a34a', marginLeft: '8px' }}>
                        ({form.discount}% off)
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ══════ SECTION 4 — SERVICE DETAILS ══════ */}
        <div className="form-section">
          <SectionHeader
            icon={<Settings2 size={20} />}
            title="Service Details"
            subtitle="Amenities, capacity, and operating hours"
          />

          <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
            Facilities & Amenities
          </p>
          <div className="facilities-grid">
            {facilitiesList.map(f => {
              const checked = form.facilities.includes(f.id);
              return (
                <button
                  type="button"
                  key={f.id}
                  className={`facility-checkbox ${checked ? 'checked' : ''}`}
                  onClick={() => toggleFacility(f.id)}
                  aria-pressed={checked}
                >
                  <div className="check-icon">
                    {checked && <Check size={12} strokeWidth={3} />}
                  </div>
                  <span>{f.icon} {f.label}</span>
                </button>
              );
            })}
          </div>

          <div className="form-grid-3" style={{ marginTop: '24px' }}>
            <Field label="Capacity (persons)" error={errors.capacity}>
              <input
                name="capacity" type="number" min="1"
                value={form.capacity} onChange={handleChange}
                placeholder="e.g. 4"
              />
            </Field>
            <Field label="Opening Hours">
              <input name="openingHours" type="time" value={form.openingHours} onChange={handleChange} />
            </Field>
            <Field label="Closing Hours">
              <input name="closingHours" type="time" value={form.closingHours} onChange={handleChange} />
            </Field>
          </div>
        </div>

        {/* ══════ SECTION 5 — IMAGES ══════ */}
        <div className="form-section">
          <SectionHeader
            icon={<ImageIcon size={20} />}
            title="Images"
            subtitle="Upload high-quality photos of your service"
          />

          {/* Cover Image */}
          <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#374151' }}>
            Cover Image <span className="required">*</span>
          </p>
          {!coverImage ? (
            <div className="image-upload-area">
              <input type="file" accept="image/*" onChange={handleCoverImage} />
              <div className="upload-icon"><ImageIcon size={24} /></div>
              <p>Click to upload cover image</p>
              <span>JPG, PNG, WEBP · Max 5 MB</span>
            </div>
          ) : (
            <div className="image-preview-grid" style={{ gridTemplateColumns: '200px' }}>
              <div className="image-preview-item">
                <img src={coverImage.preview} alt="Cover" />
                <button type="button" className="remove-btn" onClick={removeCoverImage}><X size={12} /></button>
                <span className="cover-badge">Cover</span>
              </div>
            </div>
          )}
          {errors.coverImage && (
            <p className="error-msg" style={{ marginTop: '8px' }}>
              <AlertCircle size={13} />{errors.coverImage}
            </p>
          )}

          {/* Gallery */}
          <p style={{ fontSize: '13px', fontWeight: '600', margin: '24px 0 10px', color: '#374151' }}>
            Gallery Images <span style={{ color: '#94a3b8', fontWeight: '400' }}>(up to 8)</span>
          </p>
          {galleryImages.length < 8 && (
            <div className="image-upload-area">
              <input type="file" accept="image/*" multiple onChange={handleGalleryImages} />
              <div className="upload-icon"><ImageIcon size={24} /></div>
              <p>Click to upload gallery images</p>
              <span>{galleryImages.length}/8 uploaded · JPG, PNG, WEBP</span>
            </div>
          )}

          {galleryImages.length > 0 && (
            <div className="image-preview-grid" style={{ marginTop: '16px' }}>
              {galleryImages.map((img, i) => (
                <div key={i} className="image-preview-item">
                  <img src={img.preview} alt={`Gallery ${i + 1}`} />
                  <button type="button" className="remove-btn" onClick={() => removeGalleryImage(i)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ══════ SECTION 6 — BOOKING SETTINGS ══════ */}
        <div className="form-section">
          <SectionHeader
            icon={<CalendarCheck size={20} />}
            title="Booking Settings"
            subtitle="Control how guests can book this service"
          />

          <div className="toggle-row">
            <div className="toggle-label">
              <h4>Available for Booking</h4>
              <p>Allow tourists to send booking requests for this service.</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox" name="availableForBooking"
                checked={Boolean(form.availableForBooking)} onChange={handleChange}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          {form.availableForBooking && (
            <div className="form-grid-2" style={{ marginTop: '20px' }}>
              <Field label="Minimum Booking Days">
                <input
                  name="minBookingDays" type="number" min="1"
                  value={form.minBookingDays} onChange={handleChange}
                />
              </Field>
              <Field label="Maximum Booking Days">
                <input
                  name="maxBookingDays" type="number" min="1"
                  value={form.maxBookingDays} onChange={handleChange}
                />
              </Field>
            </div>
          )}
        </div>

        {/* ══════ SECTION 7 — STATUS ══════ */}
        <div className="form-section">
          <SectionHeader
            icon={<CheckCircle2 size={20} />}
            title="Submission Status"
            subtitle="Choose how to save this service"
          />

          <div className="status-options">
            <label
              className={`status-option ${form.status === 'pending' ? 'selected pending' : ''}`}
              onClick={() => setForm(p => ({ ...p, status: 'pending' }))}
            >
              <input type="radio" name="status" value="pending" readOnly checked={form.status === 'pending'} />
              <div className="status-dot" />
              <div>
                <p style={{ fontWeight: '600', fontSize: '15px', marginBottom: '3px' }}>Submit for Approval</p>
                <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Send to admin for review and activation.</p>
              </div>
            </label>
          </div>
        </div>

        {/* ══════ FORM ACTIONS ══════ */}
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={handleReset} disabled={isSubmitting}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={17} /> Reset Form
          </button>
          <Link to="/owner/services" className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: isSubmitting ? 'none' : 'auto', opacity: isSubmitting ? 0.6 : 1 }}>
            <ArrowLeft size={17} /> Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '170px' }}>
            <Send size={17} />
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Submit for Approval'}
          </button>
        </div>
      </form>

      {/* Toast */}
      {showToast && (
        <div className="toast-success">
          <CheckCircle2 size={22} />
          {isEditMode
            ? 'Service updated successfully and sent for Admin approval!'
            : 'Service added successfully and sent to Admin dashboard for approval!'}
        </div>
      )}
    </div>
  );
};

export default AddService;
