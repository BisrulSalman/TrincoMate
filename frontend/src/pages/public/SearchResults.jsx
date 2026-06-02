import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../services/api';
import { mapServiceCard } from '../../utils/serviceDisplay';
import { useTranslation } from 'react-i18next';

const useQuery = () => new URLSearchParams(useLocation().search);

const SearchResults = () => {
  const query = useQuery();
  const q = String(query.get('q') || '').trim();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    if (!q) {
      setServices([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    api.get('/services')
      .then(res => {
        const all = res.data.services || [];
        const term = q.toLowerCase();
        const filtered = all.filter(s => {
          const name = (s.serviceName || s.name || '').toLowerCase();
          const city = (s.city || s.location || '').toLowerCase();
          const desc = (s.fullDescription || s.description || '').toLowerCase();
          const category = (s.category || s.serviceType || '').toLowerCase();
          return name.includes(term) || city.includes(term) || desc.includes(term) || category.includes(term);
        }).map(s => mapServiceCard(s));

        setServices(filtered);
      })
      .catch(err => {
        console.error('Search failed:', err);
        setError('Failed to fetch search results.');
      })
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="container section-padding animate-fade-in">
      <div style={{ marginBottom: 20 }}>
        <Link to="/">Back to Home</Link>
      </div>

      <div className="text-center" style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28 }}>{q ? t('search.resultsFor', { q }) : t('search.title')}</h1>
        <p style={{ color: 'var(--text-light)' }}>{q ? t('search.count', { count: services.length }) : t('search.enterTerm')}</p>
      </div>

      {loading ? (
        <div className="text-center">{t('search.searching')}</div>
      ) : error ? (
        <div className="card text-center" style={{ padding: 20, color: '#b91c1c' }}>{error}</div>
      ) : services.length ? (
        <div className="grid-3">
          {services.map(s => (
            <Link to={`/service/${s.id}`} key={s.id}>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <img src={s.image} alt={s.name} loading="lazy" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                <div style={{ padding: 18 }}>
                  <h3 style={{ marginBottom: 8 }}>{s.name}</h3>
                  <p style={{ marginBottom: 10, color: 'var(--text-light)' }}>{s.location}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--primary-color)' }}>${s.price}</strong>
                    <span className="btn btn-outline">View</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center" style={{ padding: 40 }}>
          <p>{t('search.noResults')}</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
