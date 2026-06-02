import { useState, useEffect } from 'react';
import { userBookingHistory as mockHistory } from '../../data/mockData';
import StatusBadge from '../../components/user/StatusBadge';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { auth } from '../../firebase/config';
import { useTranslation } from 'react-i18next';

const BookingHistory = () => {
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
        console.error('Error fetching booking history:', err);
        setLoading(false);
      });
  }, []);

  const displayBookings = bookings.length > 0 ? bookings : mockHistory;

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '28px', marginBottom: '30px' }}>{t('bookings.history')}</h1>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>{t('bookings.loading')}</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>{t('bookingTable.bookingId') || 'Booking ID'}</th>
                <th>{t('bookingTable.service') || 'Service'}</th>
                <th>{t('bookingTable.type') || 'Type'}</th>
                <th>{t('bookingTable.date') || 'Date'}</th>
                <th>{t('bookingTable.total') || 'Total'}</th>
                <th>{t('bookingTable.status') || 'Status'}</th>
                <th>{t('bookingTable.receipt') || 'Receipt'}</th>
              </tr>
            </thead>
            <tbody>
              {displayBookings.map(booking => (
                <tr key={booking.id}>
                  <td style={{ fontWeight: '600' }}>{booking.id.substring(0, 6)}</td>
                  <td>{booking.serviceName || 'Service'}</td>
                  <td><span style={{ color: 'var(--text-light)', fontSize: '14px' }}>{booking.serviceType || 'Booking'}</span></td>
                  <td>{booking.checkIn || booking.checkInDate}</td>
                  <td style={{ fontWeight: '500' }}>${booking.totalPrice}</td>
                  <td><StatusBadge status={booking.status} /></td>
                  <td>
                    <Link to={`/user/download/${booking.id}`} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px', border: '1px solid #ddd', color: 'var(--text-dark)' }}>
                      {t('bookings.pdf')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {displayBookings.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>
              No past bookings found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
