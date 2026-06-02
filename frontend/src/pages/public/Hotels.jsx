import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import BackButton from '../../components/layout/BackButton';
import api from '../../services/api';
import { categoryMatches, mapServiceCard } from '../../utils/serviceDisplay';

const placeholderImage = 'https://via.placeholder.com/400x300?text=No+Image';

const Hotels = () => {
  const { categoryName } = useParams();
  const activeCategory = categoryName ? decodeURIComponent(categoryName) : 'Hotels';
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    setServices([]);

    const fetchApproved = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/services?category=${encodeURIComponent(activeCategory)}`);
        let approved = (res.data.services || [])
          .filter(service => !service.status || service.status === 'Approved' || service.status === 'pending');

        // If owner is logged in, also include their services (so owners see their pending/draft items)
        const stored = localStorage.getItem('authUser');
        if (stored) {
          try {
            const user = JSON.parse(stored);
            if (user.role === 'owner' || user.ownerId) {
              const ownerId = user.ownerId || user.uid || 'demo-owner';
              const ownerRes = await api.get(`/services?ownerId=${encodeURIComponent(ownerId)}`);
              const ownerServices = ownerRes.data.services || [];
              // Merge owner services with approved (owner services may include pending ones)
              const map = new Map();
              approved.forEach(s => map.set(s.id, s));
              ownerServices.forEach(s => map.set(s.id, s));
              approved = Array.from(map.values());
            }
          } catch { /* ignore parse errors */ }
        }

        const categoryServices = approved.filter(service => categoryMatches(service.category || service.serviceType, activeCategory));
        if (isCurrent) setServices(categoryServices);
      } catch {
        if (isCurrent) setServices([]);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchApproved();

    const onUpdate = () => fetchApproved();
    window.addEventListener('servicesUpdated', onUpdate);
    return () => {
      isCurrent = false;
      window.removeEventListener('servicesUpdated', onUpdate);
    };
  }, [activeCategory]);

  const displayHotels = services.length > 0
    ? services.map(service => mapServiceCard(service, placeholderImage))
    : [];

  return (
    <div className="container section-padding animate-fade-in">
      <div style={{ marginBottom: '12px' }}>
        <BackButton fallback="/categories" />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>{activeCategory}</h1>
        <p>Find approved {activeCategory.toLowerCase()} services in Trincomalee</p>
      </div>

      {displayHotels.length > 0 ? (
        <div className="grid-3">
          {displayHotels.map(hotel => (
            <Link to={`/service/${hotel.id}`} key={hotel.id}>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <img src={hotel.image} alt={hotel.name} loading="lazy" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '20px' }}>{hotel.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f59e0b', fontWeight: 'bold' }}>
                      <Star size={16} fill="#f59e0b" /> {hotel.rating}
                    </div>
                  </div>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', marginBottom: '15px' }}>
                    <MapPin size={14} /> {hotel.location}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                    <div>
                      <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary-color)' }}>${hotel.price}</span> {hotel.priceType ? ` / ${hotel.priceType.replace('per_', '')}` : ''}
                    </div>
                    <span className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '14px' }}>View</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '50px 20px' }}>
          <p>{loading ? `Loading ${activeCategory}...` : `No services in the ${activeCategory} category yet.`}</p>
          <p style={{ marginTop: '8px', color: '#64748b' }}>If you are a business owner, submit your service from the Owner panel.</p>
        </div>
      )}
    </div>
  );
};

export default Hotels;
