import { Link, useLocation } from 'react-router-dom';
import { User, Calendar, FileText, LogOut, Home } from 'lucide-react';

const UserLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div style={{ padding: '0 24px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>User Menu</h2>
        </div>
        <ul className="sidebar-nav">
          <li>
            <Link to="/user" className={location.pathname === '/user' ? 'active' : ''}>
              <Home size={20} /> Dashboard Home
            </Link>
          </li>
          <li>
            <Link to="/user/profile" className={location.pathname === '/user/profile' ? 'active' : ''}>
              <User size={20} /> My Profile
            </Link>
          </li>
          <li>
            <Link to="/user/bookings" className={location.pathname === '/user/bookings' ? 'active' : ''}>
              <Calendar size={20} /> My Bookings
            </Link>
          </li>
          <li>
            <Link to="/user/history" className={location.pathname === '/user/history' ? 'active' : ''}>
              <FileText size={20} /> Booking History
            </Link>
          </li>
          <li style={{ marginTop: 'auto' }}>
            <Link to="/" style={{ color: '#e53935' }}>
              <LogOut size={20} /> Logout
            </Link>
          </li>
        </ul>
      </div>
      <div className="dashboard-content">
        {children}
      </div>
    </div>
  );
};

export default UserLayout;
