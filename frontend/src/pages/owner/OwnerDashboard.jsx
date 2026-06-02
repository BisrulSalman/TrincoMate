import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, PlusCircle, CalendarCheck, DollarSign, LogOut } from 'lucide-react';
import StatusBadge from '../../components/user/StatusBadge';
import AddService from './AddService';
import { userBookings } from '../../data/mockData';
import api from '../../services/api';
import { auth } from '../../firebase/config';

const ownerRequestConfig = () => {
  if (auth.currentUser || localStorage.getItem('authToken')) return { headers: {} };
  return { headers: { 'X-Demo-Owner': 'true' } };
};

const ownerId = () => {
  const stored = localStorage.getItem('authUser');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.ownerId || parsed.uid || parsed.id || parsed.sub || parsed.user_id || auth.currentUser?.uid || 'demo-owner';
    } catch {
      return auth.currentUser?.uid || 'demo-owner';
    }
  }
  return auth.currentUser?.uid || 'demo-owner';
};

const OwnerHome = () => (
  <div className="animate-fade-in">
    <h1 style={{ fontSize: '28px', marginBottom: '30px' }}>Owner Dashboard</h1>
    <div className="grid-3" style={{ marginBottom: '40px' }}>
      <div className="card text-center">
        <h3 style={{ fontSize: '36px', color: 'var(--primary-color)' }}>3</h3>
        <p>Active Services</p>
      </div>
      <div className="card text-center">
        <h3 style={{ fontSize: '36px', color: '#10b981' }}>12</h3>
        <p>New Bookings</p>
      </div>
      <div className="card text-center">
        <h3 style={{ fontSize: '36px', color: '#f59e0b' }}>$4,520</h3>
        <p>Monthly Earnings</p>
      </div>
    </div>

    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
        <h2 style={{ fontSize: '20px' }}>Recent Bookings</h2>
      </div>
      <table style={{ margin: 0 }}>
        <thead>
          <tr><th>ID</th><th>Service</th><th>Guest</th><th>Date</th><th>Total</th><th>Status</th></tr>
        </thead>
        <tbody>
          {userBookings.map(b => (
            <tr key={b.id}>
              <td style={{ fontWeight: '600' }}>{b.id}</td>
              <td>{b.serviceName}</td>
              <td>John Doe</td>
              <td>{b.checkIn}</td>
              <td>${b.totalPrice}</td>
              <td><StatusBadge status={b.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const MyServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  const fetchOwnerServices = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/services?ownerId=${ownerId()}`);
      const found = res.data.services || [];
      if (found.length) {
        setServices(found);
        return;
      }

      // Fallback: fetch all services and filter client-side by ownerId
      try {
        const allRes = await api.get('/services');
        const list = (allRes.data.services || []).filter(s => String(s.ownerId) === String(ownerId()));
        setServices(list);
      } catch (err) {
        console.error('Fallback fetch owner services failed:', err);
      }
    } catch (err) {
      console.error('Error fetching owner services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerServices();
    const onUpdate = () => fetchOwnerServices();
    window.addEventListener('servicesUpdated', onUpdate);
    return () => window.removeEventListener('servicesUpdated', onUpdate);
  }, []);

  useEffect(() => {
    api.get('/categories')
      .then(res => {
        setCategories(res.data.categories || []);
      })
      .catch(err => console.error('Error loading categories for owner:', err));
  }, []);

  const handleRemoveService = async (service) => {
    if (!window.confirm(`Remove "${service.name}"?`)) return;

    try {
      await api.delete(`/services/${service.id}`, ownerRequestConfig());
      setServices(prev => prev.filter(s => s.id !== service.id));
        // Notify other pages (Home, Hotels) to refresh their lists
        try { window.dispatchEvent(new Event('servicesUpdated')); } catch { /* ignore */ }
    } catch (err) {
      console.error('Remove service error:', err);
      alert(err.response?.data?.error || 'Failed to remove service.');
    }
  };

  const displayServices = services.map(s => ({
        id: s.id,
        name: s.serviceName || s.name || 'Untitled Service',
        type: s.serviceType || s.category || 'Service',
        rawPrice: s.price,
        price: `$${s.price}/${s.priceType?.split('_')[1] || 'unit'}`,
        bookings: 0,
        status: s.status === 'draft' ? 'Draft' : s.status === 'pending' ? 'Pending' : 'Approved',
        image: s.coverImage || s.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
      }));

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '28px', marginBottom: '6px' }}>My Services</h2>
          <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>Filter by category</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px' }}>
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <Link to="/owner/add-service" className="btn btn-primary">+ Add Service</Link>
        </div>
      </div>
      
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading your services...</div>
      ) : (
        <div className="grid-3">
          {displayServices
            .filter(s => selectedCategory === 'All' ? true : (s.type === selectedCategory || s.category === selectedCategory))
            .map((s) => (
            <div className="card" key={s.id} style={{ padding: 0, overflow: 'hidden' }}>
              <img src={s.image} alt={s.name} loading="lazy" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px' }}>{s.name}</h3>
                  <StatusBadge status={s.status} />
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>{s.type} · {s.price}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '12px' }}>{s.bookings} bookings this month</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => navigate(`/owner/edit-service/${s.id}`)} className="btn btn-outline" style={{ flex: 1, padding: '6px', fontSize: '13px' }}>Edit</button>
                  <button onClick={() => window.open(`/service/${s.id}`, '_blank')} className="btn btn-outline" style={{ flex: 1, padding: '6px', fontSize: '13px' }}>View</button>
                  <button onClick={() => handleRemoveService(s)} style={{ flex: 1, padding: '6px', fontSize: '13px', background: '#ffebee', color: '#e53935', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Remove</button>
                </div>
              </div>
            </div>
          ))}
          {displayServices.length === 0 && (
            <div className="card text-center" style={{ gridColumn: '1 / -1', padding: '50px 20px' }}>
              <p>No services yet. Click "+ Add Service" to create one.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


const ManageOwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    api.get('/bookings', ownerRequestConfig())
      .then(res => {
        setBookings(res.data.bookings || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = (id, newStatus) => {
    api.put(`/bookings/${id}/status`, { status: newStatus }, ownerRequestConfig())
      .then((res) => {
        // Optimistic UI update
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
        if (newStatus === 'Approved' && res.data.emailNotification?.sent === false) {
          alert(`Booking approved, but email was not sent: ${res.data.emailNotification.reason || res.data.emailNotification.error || 'Email service unavailable.'}`);
        }
      })
      .catch(err => {
        console.error('Failed to update status:', err);
        alert('Failed to update booking status.');
      });
  };

  const displayBookings = bookings.length > 0 ? bookings : userBookings; // Fallback to mock data

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '28px', marginBottom: '30px' }}>Manage Bookings</h2>
      
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading bookings...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ margin: 0 }}>
            <thead><tr><th>ID</th><th>Service</th><th>Guest</th><th>Check-in</th><th>Check-out</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {displayBookings.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: '600' }}>{b.id.substring(0,6)}</td>
                  <td>{b.serviceName || 'Service'}</td>
                  <td>{b.guestName || 'John Doe'}</td>
                  <td>{b.checkIn || b.checkInDate || '2024-05-15'}</td>
                  <td>{b.checkOut || b.checkOutDate || '2024-05-18'}</td>
                  <td>${b.totalPrice}</td>
                  <td><StatusBadge status={b.status} /></td>
                  <td>
                    {b.status === 'Pending' || b.status === 'pending' ? (
                      <>
                        <button onClick={() => handleUpdateStatus(b.id, 'Approved')} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px', marginRight: '4px' }}>Approve</button>
                        <button onClick={() => handleUpdateStatus(b.id, 'Rejected')} style={{ padding: '4px 10px', fontSize: '12px', background: '#ffebee', color: '#e53935', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Reject</button>
                      </>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#888' }}>No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const Earnings = () => (
  <div className="animate-fade-in">
    <h2 style={{ fontSize: '28px', marginBottom: '30px' }}>Earnings Report</h2>
    <div className="grid-3" style={{ marginBottom: '40px' }}>
      <div className="card text-center">
        <h3 style={{ fontSize: '32px', color: '#10b981' }}>$4,520</h3>
        <p>This Month</p>
      </div>
      <div className="card text-center">
        <h3 style={{ fontSize: '32px', color: 'var(--primary-color)' }}>$12,800</h3>
        <p>Total Earned</p>
      </div>
      <div className="card text-center">
        <h3 style={{ fontSize: '32px', color: '#f59e0b' }}>25</h3>
        <p>Total Bookings</p>
      </div>
    </div>
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}><h2 style={{ fontSize: '20px' }}>Monthly Breakdown</h2></div>
      <table style={{ margin: 0 }}>
        <thead><tr><th>Month</th><th>Bookings</th><th>Revenue</th><th>Commission (10%)</th><th>Net Earnings</th></tr></thead>
        <tbody>
          {[
            { month: 'May 2024', bookings: 12, revenue: 4520, comm: 452, net: 4068 },
            { month: 'Apr 2024', bookings: 9, revenue: 3200, comm: 320, net: 2880 },
            { month: 'Mar 2024', bookings: 4, revenue: 1500, comm: 150, net: 1350 },
          ].map((r, i) => (
            <tr key={i}>
              <td style={{ fontWeight: '600' }}>{r.month}</td>
              <td>{r.bookings}</td>
              <td>${r.revenue}</td>
              <td style={{ color: '#e53935' }}>-${r.comm}</td>
              <td style={{ fontWeight: '700', color: '#10b981' }}>${r.net}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const OwnerDashboard = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div style={{ padding: '0 24px 20px', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #0066cc, #00aaff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>O</div>
            <div>
              <p style={{ fontWeight: '600', fontSize: '14px' }}>Rajan Kumar</p>
              <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>Business Owner</p>
            </div>
          </div>
        </div>
        <div style={{ padding: '0 24px', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Owner Panel</h2>
        </div>
        <ul className="sidebar-nav">
          <li>
            <Link to="/owner" className={location.pathname === '/owner' ? 'active' : ''}>
              <LayoutDashboard size={20} /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/owner/services" className={isActive('/owner/services') ? 'active' : ''}>
              <Briefcase size={20} /> My Services
            </Link>
          </li>
          <li>
            <Link to="/owner/add-service" className={isActive('/owner/add-service') ? 'active' : ''}>
              <PlusCircle size={20} /> Add Service
            </Link>
          </li>
          <li>
            <Link to="/owner/bookings" className={isActive('/owner/bookings') ? 'active' : ''}>
              <CalendarCheck size={20} /> Manage Bookings
            </Link>
          </li>
          <li>
            <Link to="/owner/earnings" className={isActive('/owner/earnings') ? 'active' : ''}>
              <DollarSign size={20} /> Earnings
            </Link>
          </li>
          <li style={{ marginTop: '40px' }}>
            <Link to="/" style={{ color: '#e53935' }}>
              <LogOut size={20} /> Logout
            </Link>
          </li>
        </ul>
      </div>
      <div className="dashboard-content">
        <Routes>
          <Route index element={<OwnerHome />} />
          <Route path="services" element={<MyServices />} />
          <Route path="add-service" element={<AddService />} />
          <Route path="edit-service/:id" element={<AddService />} />
          <Route path="bookings" element={<ManageOwnerBookings />} />
          <Route path="earnings" element={<Earnings />} />
        </Routes>
      </div>
    </div>
  );
};

export default OwnerDashboard;
