import { userProfile, userBookings } from '../../data/mockData';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/user/StatusBadge';
import { getSession } from '../../services/auth';
import { useTranslation } from 'react-i18next';

const DashboardHome = () => {
  const { user } = getSession();
  const displayName = user?.name || user?.fullName || userProfile.name;
  const firstName = displayName.trim().split(/\s+/)[0] || 'there';
  const avatar = user?.avatar || userProfile.avatar;
  const activeBookings = userBookings.filter(b => b.status === 'Approved' || b.status === 'Pending');
  const { t } = useTranslation();

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
        <img 
          src={avatar}
          alt={displayName}
          style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--white)', boxShadow: 'var(--shadow)' }} 
        />
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>{t('dashboard.welcomeBack', { name: firstName })}</h1>
          <p style={{ color: 'var(--text-light)' }}>{t('dashboard.manageFromHere')}</p>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '40px' }}>
        <div className="card text-center">
          <h3 style={{ fontSize: '36px', color: 'var(--primary-color)' }}>{userBookings.length}</h3>
          <p>{t('dashboard.totalBookings')}</p>
        </div>
        <div className="card text-center">
          <h3 style={{ fontSize: '36px', color: '#10b981' }}>{activeBookings.length}</h3>
          <p>{t('dashboard.activeTrips')}</p>
        </div>
        <div className="card text-center">
          <h3 style={{ fontSize: '36px', color: '#f59e0b' }}>12</h3>
          <p>{t('dashboard.savedPlaces')}</p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px' }}>{t('dashboard.recentActivity')}</h2>
          <Link to="/user/bookings" style={{ color: 'var(--primary-color)', fontWeight: '500', fontSize: '14px' }}>{t('dashboard.viewAll')}</Link>
        </div>
        
        <table style={{ marginTop: 0 }}>
          <thead>
            <tr>
              <th>Service</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {userBookings.slice(0, 3).map(booking => (
              <tr key={booking.id}>
                <td style={{ fontWeight: '500' }}>{booking.serviceName}</td>
                <td>{booking.checkIn}</td>
                <td><StatusBadge status={booking.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardHome;
