import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star } from 'lucide-react';
import api from '../../services/api';

const placeholderImage = 'https://via.placeholder.com/400x300?text=No+Image';

const Home = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    api.get('/categories')
      .then(categoryRes => {
        const backendCategories = categoryRes.data.categories || [];
        setCategories(backendCategories);
      })
      .catch(err => {
        console.warn('Categories endpoint missing, falling back to local mock data', err);
        // fallback to local mock data
        import('../../data/mockData').then(m => {
          setCategories(m.categories || []);
        }).catch(e => console.error(e));
      })
      .finally(() => setCategoriesLoading(false));

    const fetchServices = async () => {
      try {
        const serviceRes = await api.get('/services?status=Approved');
        let approved = serviceRes.data.services || [];

        const stored = localStorage.getItem('authUser');
        if (stored) {
          try {
            const user = JSON.parse(stored);
            if (user.role === 'owner' || user.ownerId) {
              const ownerId = user.ownerId || user.uid || 'demo-owner';
              const ownerRes = await api.get(`/services?ownerId=${encodeURIComponent(ownerId)}`);
              const ownerServices = ownerRes.data.services || [];
              const map = new Map();
              approved.forEach(s => map.set(s.id, s));
              ownerServices.forEach(s => map.set(s.id, s));
              approved = Array.from(map.values());
            }
          } catch { /* ignore */ }
        }

        if (!approved.length) {
          try {
            const allRes = await api.get('/services');
            approved = allRes.data.services || [];
          } catch {
            // fallback to local mock data
            try {
              const m = await import('../../data/mockData');
              approved = m.hotels || [];
            } catch (e) {
              console.error('No local fallback for services', e);
            }
          }
        }

        setServices(approved);
      } catch (err) {
        setApiError('Unable to load services. Please start the backend at http://localhost:5000 or set VITE_API_URL to the correct API endpoint.');
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();

    const onUpdate = () => fetchServices();
    window.addEventListener('servicesUpdated', onUpdate);
    return () => window.removeEventListener('servicesUpdated', onUpdate);
  }, []);

  // Suggestions: derive from `services` with debounce
  useEffect(() => {
    if (!searchTerm || !services.length) {
      setSuggestions([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const timeout = setTimeout(() => {
      const matches = services.filter(s => {
        const name = (s.serviceName || s.name || '').toLowerCase();
        const city = (s.city || s.location || '').toLowerCase();
        const category = (s.category || s.serviceType || '').toLowerCase();
        return name.includes(term) || city.includes(term) || category.includes(term);
      }).slice(0, 6).map(s => ({ id: s.id, name: s.serviceName || s.name, location: s.city || s.location || 'Unknown', price: s.price || 0 }));

      setSuggestions(matches);
    }, 220);

    return () => clearTimeout(timeout);
  }, [searchTerm, services]);

  const displayHotels = services.length > 0 
    ? services.slice(0, 6).map(s => ({
        id: s.id,
        name: s.serviceName || s.name,
        image: s.coverImage || s.image || placeholderImage,
        rating: s.rating || 5.0,
        location: s.city || s.location || 'Unknown location',
        price: s.price || 0
      }))
    : [];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: `linear-gradient(rgba(0, 0, 0, 0.46), rgba(1, 25, 66, 0.46)), url('https://images.unsplash.com/photo-1544644181-1484b3fdfc62?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '620px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        padding: '60px 20px'
      }}>
        <div className="container animate-fade-in">
          <p style={{ color: '#7dd3fc', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '20px' }}>{t('home.tagline')}</p>
          <h1 style={{ fontSize: '58px', marginBottom: '18px', color: 'white', lineHeight: 1.05 }}>
            {t('home.welcome')}
          </h1>

          <form onSubmit={(e) => { e.preventDefault(); if (searchTerm.trim()) navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`); }}>
            <div style={{
              background: 'rgba(255,255,255,0.95)', padding: '12px', borderRadius: '16px',
              display: 'flex', maxWidth: '840px', margin: '0 auto 50px', gap: '10px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.18)'
            }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 18px', borderRight: '1px solid #e2e8f0' }}>
                <MapPin size={20} color="#0f172a" style={{ marginRight: '10px', flexShrink: 0 }} />
                <div style={{ position: 'relative', width: '100%' }} ref={suggRef}>
                  <input
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                    type="text"
                    placeholder={t('home.searchPlaceholder')}
                    style={{ border: 'none', width: '100%', outline: 'none', fontSize: '16px', color: '#0f172a' }}
                  />

                  {showSuggestions && suggestions.length > 0 && (
                    <div style={{ position: 'absolute', left: 0, right: 0, top: '44px', background: 'var(--surface)', boxShadow: 'var(--shadow)', borderRadius: '10px', zIndex: 40, maxHeight: 260, overflowY: 'auto' }}>
                      {suggestions.map(s => (
                        <div key={s.id} role="button" tabIndex={0} onMouseDown={() => { navigate(`/service/${s.id}`); }} style={{ padding: '10px 12px', borderBottom: '1px solid #eef2f7', cursor: 'pointer' }}>
                          <div style={{ fontWeight: 600 }}>{s.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{s.location} • {s.price ? `$${s.price}` : 'Price unknown'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '14px 30px', fontSize: '16px', borderRadius: '12px' }}>
                <Search size={20} /> Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-padding container">
        <div className="text-center" style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>{t('home.exploreCategories')}</h2>
          <p>{t('home.findNeed')}</p>
        </div>
        {categoriesLoading ? (
          <div className="text-center" style={{ padding: '40px' }}>{t('home.loadingCategories')}</div>
        ) : categories.length > 0 ? (
          <div className="grid-3">
            {categories.map(category => (
              <Link to={`/category/${encodeURIComponent(category.name)}`} key={category.id}>
                <div className="card text-center" style={{ cursor: 'pointer', padding: '36px 20px' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'rgba(0,102,204,0.1)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 16px',
                    fontSize: '22px', color: 'var(--primary-color)', fontWeight: '700'
                  }}>
                    {category.name.charAt(0)}
                  </div>
                  <h3 style={{ marginBottom: '8px', color: 'var(--primary-color)' }}>{category.name}</h3>
                  <p style={{ fontSize: '14px' }}>{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : apiError ? (
          <div className="card text-center" style={{ padding: '40px 20px', background: '#fff4e5', color: '#663c00' }}>
            <h3 style={{ marginBottom: '10px' }}>Cannot load data</h3>
            <p>{apiError}</p>
          </div>
        ) : (
          <div className="card text-center" style={{ padding: '40px 20px' }}>
            <p>No categories available yet.</p>
          </div>
        )}
      </section>

      <section className="section-padding container">
        <div className="text-center" style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>Why travelers trust TrincoMate</h2>
          <p>Fast bookings, local partners, and handpicked recommendations for every trip.</p>
        </div>
        <div className="grid-3">
          <div className="card" style={{ padding: '30px 24px' }}>
            <h3 style={{ marginBottom: '12px', color: 'var(--primary-color)' }}>Verified Listings</h3>
            <p>Every service is reviewed to make sure you get a safe, enjoyable experience.</p>
          </div>
          <div className="card" style={{ padding: '30px 24px' }}>
            <h3 style={{ marginBottom: '12px', color: 'var(--primary-color)' }}>Local Expert Support</h3>
            <p>Our team is available to help with bookings and local guidance whenever you need it.</p>
          </div>
          <div className="card" style={{ padding: '30px 24px' }}>
            <h3 style={{ marginBottom: '12px', color: 'var(--primary-color)' }}>Flexible Travel Options</h3>
            <p>Choose from hotels, tours, guides, restaurants, and adventure activities in one place.</p>
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section style={{ backgroundColor: '#f8fafc' }} className="section-padding">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>Featured Services</h2>
            <p>Top-rated stays and activities in Trincomalee</p>
          </div>
          
          {loading ? (
            <div className="text-center" style={{ padding: '40px' }}>Loading services...</div>
          ) : displayHotels.length > 0 ? (
            <div className="grid-3">
              {displayHotels.map(hotel => (
                <Link to={`/service/${hotel.id}`} key={hotel.id}>
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <img src={hotel.image} alt={hotel.name} loading="lazy" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
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
                          <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary-color)' }}>${hotel.price}</span> / night
                        </div>
                        <span className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '14px' }}>View</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card text-center" style={{ padding: '50px 20px' }}>
              <p>No approved services yet. Add a service as owner, then approve it from Admin.</p>
            </div>
          )}
        </div>
      </section>

      {/* Gallery and Reviews removed */}
    </div>
  );
};

export default Home;
