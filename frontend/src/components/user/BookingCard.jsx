import { Calendar, Users, DollarSign } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BookingCard = ({ booking }) => {
  const { t } = useTranslation();
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <img src={booking.image} alt={booking.serviceName} loading="lazy" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{booking.serviceName}</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-light)' }}>{booking.serviceType}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
        
        <div style={{ margin: '15px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '15px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '8px' }}>
            <Calendar size={16} color="var(--primary-color)" /> 
            <span>{booking.checkIn} {booking.checkOut !== booking.checkIn ? `- ${booking.checkOut}` : ''}</span>
          </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <Users size={16} color="var(--primary-color)" /> 
            <span>{t('bookings.guests', { count: booking.guests })}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '18px' }}>
            <DollarSign size={18} />{booking.totalPrice}
          </div>
          <Link to={`/user/download/${booking.id}`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '14px' }}>
            {t('bookings.getPdf')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
