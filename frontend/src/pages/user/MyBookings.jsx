import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { userBookings as mockUserBookings } from '../../data/mockData';
import BookingCard from '../../components/user/BookingCard';
import api from '../../services/api';
import { auth } from '../../firebase/config';

const MyBookings = () => {
  const [filter, setFilter] = useState('All');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    api.get('/bookings')
      .then(res => {
        setBookings(res.data.bookings || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
        setLoading(false);
      });
  }, []);

  const displayBookings = bookings.length > 0 ? bookings : mockUserBookings;

  const filteredBookings = filter === 'All' 
    ? displayBookings 
    : displayBookings.filter(b => b.status === filter || b.status?.toLowerCase() === filter.toLowerCase());

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px' }}>{t('bookings.myBookings')}</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
            <button 
              key={status} 
              onClick={() => setFilter(status)}
              className={filter === status ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '20px' }}
            >
              {t(`bookings.${status.toLowerCase()}`) || status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>{t('bookings.loading')}</div>
      ) : filteredBookings.length > 0 ? (
        <div className="grid-3">
          {filteredBookings.map(booking => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '60px 20px' }}>
          <p style={{ fontSize: '18px', color: 'var(--text-light)' }}>{t('bookings.none')}</p>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
