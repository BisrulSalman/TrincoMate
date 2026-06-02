import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BackButton from '../../components/layout/BackButton';
import { Star, MapPin, Phone, Mail, CheckCircle, Bookmark } from 'lucide-react';
import api from '../../services/api';
import { auth } from '../../firebase/config';
import { useTranslation } from 'react-i18next';

const fallbackContact = { phone: '+94 77 123 4567', email: 'info@trincomate.com' };
const placeholderImage = 'https://via.placeholder.com/1200x600?text=No+Image';

const normalizeService = (service) => ({
  id: service?.id || '',
  name: service?.serviceName || service?.name || 'Service Details',
  category: service?.category || service?.serviceType || 'Service',
  serviceType: service?.serviceType || service?.category || 'Service',
  location: service?.city || service?.location || 'Unknown location',
  price: Number(service?.price || 0),
  priceType: service?.priceType || 'per_night',
  rating: service?.rating ?? 0,
  description: service?.fullDescription || service?.description || 'No description provided.',
  facilities: Array.isArray(service?.facilities) && service.facilities.length ? service.facilities : [],
  contact: service?.contact || fallbackContact,
  image: service?.coverImage || service?.image || placeholderImage,
  gallery: Array.isArray(service?.gallery) && service.gallery.length ? service.gallery : [],
  ownerId: service?.ownerId || null,
});

const userRequestConfig = () => (
  auth.currentUser || localStorage.getItem('authToken') ? {} : { headers: { 'X-Demo-User': 'true' } }
);

const ownerRequestConfig = () => {
  if (auth.currentUser || localStorage.getItem('authToken')) return { headers: {} };
  return { headers: { 'X-Demo-Owner': 'true' } };
};

const currentUserId = () => {
  const stored = localStorage.getItem('authUser');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.ownerId || parsed.uid || 'demo-owner';
    } catch {
      return 'demo-owner';
    }
  }
  return auth.currentUser?.uid || 'demo-owner';
};

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const [saved, setSaved] = useState(false);

  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
  });
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSaveToggle = () => {
    setSaved(!saved);
    // TODO: Persist to localStorage or backend
  };

  useEffect(() => {
    setService(null);
    setLoading(true);
    setLoadError('');

    api.get(`/services/${id}`)
      .then(res => {
        setService(normalizeService(res.data.service));
        setLoadError('');
      })
      .catch(err => {
        console.error('Error loading service:', err);
        setLoadError(err.response?.data?.error || 'This service could not be found. It may still need admin approval.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = (serviceObj) => {
    if (!serviceObj) return false;
    const uid = currentUserId();
    return (serviceObj.ownerId && String(serviceObj.ownerId) === String(uid)) || (localStorage.getItem('X-Demo-Owner') === 'true' || false) || false;
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${service.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/services/${service.id}`, ownerRequestConfig());
      // Notify lists to refresh
      try { window.dispatchEvent(new Event('servicesUpdated')); } catch { /* ignore */ }
      navigate('/owner/services');
    } catch (err) {
      console.error('Delete service failed:', err);
      alert(err.response?.data?.error || 'Failed to delete service.');
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingStatus('Submitting booking...');

    try {
      await api.post('/bookings', {
        serviceId: service.id,
        serviceName: service.name,
        serviceType: service.serviceType,
        guestName: bookingData.name,
        guestEmail: bookingData.email,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut || bookingData.checkIn,
        guests: bookingData.guests,
        totalPrice: service.price * Number(bookingData.guests || 1),
        language: localStorage.getItem('i18nextLng') || 'en',
      }, userRequestConfig());

      setBookingStatus('Booking request sent. Admin and owner can now approve or reject it.');
      setBookingData({ name: '', email: '', checkIn: '', checkOut: '', guests: 1 });
    } catch (err) {
      console.error('Booking error:', err);
      setBookingStatus(err.response?.data?.error || 'Failed to create booking.');
    }
  };

  if (loading) {
    return (
      <div className="container section-padding animate-fade-in" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ fontSize: '16px', color: 'var(--text-light)' }}>{t('service.loading')}</p>
      </div>
    );
  }

  if (loadError || !service) {
    return (
      <div className="container section-padding animate-fade-in">
        <div style={{ marginBottom: '12px' }}>
          <BackButton fallback="/" />
        </div>
        <div className="card text-center" style={{ padding: '50px 20px' }}>
          <h2 style={{ fontSize: '22px', marginBottom: '10px' }}>{t('service.serviceUnavailable')}</h2>
          <p>{loadError || t('service.serviceNotFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container section-padding animate-fade-in">

      <div style={{ marginBottom: '12px' }}>
        <BackButton fallback="/" />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '10px' }}>
            <h1 style={{ fontSize: '36px', margin: 0 }}>{service.name}</h1>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isOwner(service) && (
              <>
                <button onClick={() => navigate(`/owner/edit-service/${service.id}`)} className="btn btn-outline" style={{ padding: '8px 10px', fontSize: '13px' }}>{t('service.edit')}</button>
                <button onClick={handleDelete} className="btn" style={{ padding: '8px 10px', fontSize: '13px', background: '#fee2e2', color: '#b91c1c' }}>{t('service.remove')}</button>
              </>
            )}
            <button onClick={handleSaveToggle} className="btn btn-outline" style={{ padding: '8px 10px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} /> {saved ? t('service.saved') : t('service.save')}
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f59e0b', fontWeight: 'bold' }}>
            <Star size={20} fill="#f59e0b" /> {service.rating}
          </div>
          <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <MapPin size={18} /> {service.location}
          </p>
        </div>
      </div>

      <div>
        {loading && (
          <p style={{ marginBottom: '14px', color: 'var(--text-light)', fontSize: '14px' }}>{t('service.refreshing')}</p>
        )}
          <img
            src={service.image}
            alt={service.name}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = placeholderImage; }}
            loading="lazy"
            style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px', marginBottom: '40px' }}
          />

          {/* Gallery thumbnails (owner-uploaded images) */}
          {service.gallery && service.gallery.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {service.gallery.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${service.name} - ${idx + 1}`}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = placeholderImage; }}
                  loading="lazy"
                  style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                />
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>{t('service.about', { name: service.name })}</h2>
              <p style={{ marginBottom: '30px', fontSize: '16px', lineHeight: '1.8' }}>{service.description}</p>

              <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>{t('service.facilities')}</h3>
              <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '40px' }}>
                {service.facilities.map((facility, index) => (
                  <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle size={18} color="var(--primary-color)" /> {facility}
                  </li>
                ))}
              </ul>

              <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>{t('service.contactInfo')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={18} /> {service.contact.phone}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={18} /> {service.contact.email}</div>
              </div>
            </div>

            <div>
                <div className="card" style={{ position: 'sticky', top: '100px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--primary-color)' }}>
                  ${service.price} <span style={{ fontSize: '16px', color: 'var(--text-light)', fontWeight: 'normal' }}>/{service.priceType.replace('per_', '')}</span>
                </div>

                <form onSubmit={handleBooking}>
                  <div className="input-group">
                    <label>{t('service.fullName')}</label>
                    <input type="text" required placeholder="John Doe" value={bookingData.name} onChange={e => setBookingData({ ...bookingData, name: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>{t('service.emailAddress')}</label>
                    <input type="email" required placeholder="john@example.com" value={bookingData.email} onChange={e => setBookingData({ ...bookingData, email: e.target.value })} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="input-group">
                      <label>{t('service.checkIn')}</label>
                      <input type="date" required value={bookingData.checkIn} onChange={e => setBookingData({ ...bookingData, checkIn: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label>{t('service.checkOut')}</label>
                      <input type="date" value={bookingData.checkOut} onChange={e => setBookingData({ ...bookingData, checkOut: e.target.value })} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>{t('service.guests')}</label>
                    <input type="number" min="1" required value={bookingData.guests} onChange={e => setBookingData({ ...bookingData, guests: e.target.value })} />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                    {t('service.requestBooking')}
                  </button>
                  {bookingStatus && (
                    <p style={{ marginTop: '12px', fontSize: '13px', color: bookingStatus.startsWith('Failed') ? '#dc2626' : 'var(--primary-color)' }}>
                      {bookingStatus}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
