import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Map as MapIcon, Tags, ClipboardList, LogOut, Image, MessageSquare } from 'lucide-react';
import { userBookings } from '../../data/mockData';
import StatusBadge from '../../components/user/StatusBadge';
import api from '../../services/api';
import { auth } from '../../firebase/config';
import { getSession, clearSession } from '../../services/auth';

const getSavedUser = () => {
  try {
    return JSON.parse(localStorage.getItem('authUser'));
  } catch {
    return null;
  }
};

const adminRequestConfig = () => {
  const authToken = localStorage.getItem('authToken');
  const savedUser = getSavedUser();
  const isAuthenticated = auth.currentUser || authToken;
  const isAdmin = savedUser?.role === 'admin';

  if (!isAuthenticated) {
    return { headers: { 'X-Demo-Admin': 'true' } };
  }

  if (!isAdmin) {
    // If a non-admin session is present, do not auto-escalate.
    return {};
  }

  return {};
};

const AdminHome = () => (
  <div className="animate-fade-in">
    <h1 style={{ fontSize: '28px', marginBottom: '30px' }}>Admin Dashboard</h1>
    <div className="grid-3" style={{ marginBottom: '40px' }}>
      <div className="card text-center">
        <h3 style={{ fontSize: '36px', color: 'var(--primary-color)' }}>150</h3>
        <p>Total Users</p>
      </div>
      <div className="card text-center">
        <h3 style={{ fontSize: '36px', color: '#10b981' }}>45</h3>
        <p>Business Owners</p>
      </div>
      <div className="card text-center">
        <h3 style={{ fontSize: '36px', color: '#8b5cf6' }}>320</h3>
        <p>Total Services</p>
      </div>
    </div>
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
        <h2 style={{ fontSize: '20px' }}>Recent Bookings</h2>
      </div>
      <table style={{ margin: 0 }}>
        <thead>
          <tr>
            <th>ID</th><th>Service</th><th>Date</th><th>Total</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {userBookings.map(b => (
            <tr key={b.id}>
              <td style={{ fontWeight: '600' }}>{b.id}</td>
              <td>{b.serviceName}</td>
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

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchCategories = () => {
    setLoading(true);
    api.get('/categories')
      .then(res => {
        setCategories(res.data.categories || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch categories error:', err);
        // Fallback to defaults so UI is never empty
        setCategories([
          { id: '1', name: 'Hotels', description: 'Tourism category' },
          { id: '2', name: 'Restaurants', description: 'Tourism category' },
          { id: '3', name: 'Tour Guides', description: 'Tourism category' },
          { id: '4', name: 'Vehicle Rentals', description: 'Tourism category' },
          { id: '5', name: 'Boat Tours', description: 'Tourism category' },
          { id: '6', name: 'Water Sports', description: 'Tourism category' },
        ]);
        setLoading(false);
      });
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAddCategory = async () => {
    const newCat = window.prompt('Enter new category name:');
    if (!newCat || !newCat.trim()) return;
    try {
      const res = await api.post(
        '/categories',
        { name: newCat.trim(), description: 'Tourism category' },
        adminRequestConfig()
      );
      setCategories(prev => [...prev, res.data]);
    } catch (err) {
      console.error('Add category error:', err);
      alert(err.response?.data?.error || 'Failed to add category. Make sure you are logged in as Admin.');
    }
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;
    try {
      await api.put(`/categories/${id}`, { name: editName.trim() }, adminRequestConfig());
      setCategories(prev => prev.map(c => c.id === id ? { ...c, name: editName.trim() } : c));
      setEditingId(null);
    } catch (err) {
      console.error('Edit category error:', err);
      alert(err.response?.data?.error || 'Failed to update category.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`, adminRequestConfig());
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Delete category error:', err);
      alert(err.response?.data?.error || 'Failed to delete category.');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px' }}>Manage Categories</h2>
        <button onClick={handleAddCategory} className="btn btn-primary">+ Add Category</button>
      </div>
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading categories...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ margin: 0 }}>
            <thead><tr><th>#</th><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr key={cat.id}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: '600' }}>
                    {editingId === cat.id ? (
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #ddd', width: '180px' }}
                        autoFocus
                      />
                    ) : cat.name}
                  </td>
                  <td style={{ color: 'var(--text-light)' }}>{cat.description || 'Tourism category'}</td>
                  <td>
                    {editingId === cat.id ? (
                      <>
                        <button onClick={() => handleSaveEdit(cat.id)} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '12px', marginRight: '6px' }}>Save</button>
                        <button onClick={() => setEditingId(null)} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleStartEdit(cat)} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px', marginRight: '8px' }}>Edit</button>
                        <button onClick={() => handleDelete(cat.id)} style={{ padding: '4px 10px', fontSize: '12px', background: '#ffebee', color: '#e53935', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>No categories yet. Click "+ Add Category" to create one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};




const ManageOwners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
    const [services, setServices] = useState([]);

  const loadOwners = () => {
    setLoading(true);
    Promise.all([
      api.get('/auth/owners', adminRequestConfig()).catch(() => ({ data: { owners: [] } })),
      api.get('/services', adminRequestConfig()).catch(() => ({ data: { services: [] } })),
    ]).then(([ownersRes, servicesRes]) => {
      setOwners(ownersRes.data.owners || []);
      setServices(servicesRes.data.services || []);
    }).catch(err => {
      console.error('Fetch owners/services error:', err);
      alert('Failed to load owners or services.');
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadOwners(); }, []);

  const handleRemoveOwner = async (owner) => {
    if (!window.confirm(`Remove ${owner.ownerName || owner.name}? This also removes the owner's submitted services.`)) return;

    try {
      await api.delete(`/auth/owners/${owner.ownerId || owner.id}`, adminRequestConfig());
      setOwners(prev => prev.filter(item => item.id !== owner.id));
    } catch (err) {
      console.error('Remove owner error:', err);
      alert(err.response?.data?.error || 'Failed to remove owner.');
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '28px', marginBottom: '30px' }}>Manage Owners</h2>
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading owners...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ margin: 0 }}>
            <thead><tr><th>#</th><th>Name</th><th>Service</th><th>Categories</th><th>Email</th><th>Phone</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {owners.map((owner, i) => (
                <tr key={owner.ownerId || owner.id}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: '600' }}>{owner.ownerName || owner.name}</td>
                  <td>
                    {owner.serviceName ? owner.serviceName : (
                      (() => {
                        const ownerId = owner.ownerId || owner.id;
                        const byCategory = {};
                        services.forEach(s => {
                          if (String(s.ownerId) === String(ownerId)) {
                            const cat = s.category || 'Uncategorized';
                            byCategory[cat] = (byCategory[cat] || 0) + 1;
                          }
                        });
                        const entries = Object.entries(byCategory);
                        if (!entries.length) return '-';
                        return entries.map(([cat, count]) => (
                          <span key={cat} style={{ display: 'inline-block', marginRight: '8px', padding: '4px 8px', background: '#f1f5f9', borderRadius: '8px', fontSize: '13px' }}>
                            {cat}: {count}
                          </span>
                        ));
                      })()
                    )}
                  </td>
                  <td>
                    {(() => {
                      const ownerId = owner.ownerId || owner.id;
                      const cats = new Set();
                      services.forEach(s => {
                        if (String(s.ownerId) === String(ownerId) && s.category) cats.add(s.category);
                      });
                      if (!cats.size) return '-';
                      return Array.from(cats).map(cat => (
                        <span key={cat} style={{ display: 'inline-block', marginRight: '6px', padding: '4px 8px', background: '#eef2ff', borderRadius: '8px', fontSize: '13px' }}>{cat}</span>
                      ));
                    })()}
                  </td>
                  <td>{owner.email}</td>
                  <td>{owner.phoneNumber || '-'}</td>
                  <td><StatusBadge status={owner.status} /></td>
                  <td>
                    <button onClick={() => api.put(`/auth/owners/${owner.ownerId}/status`, { status: 'Approved' }, adminRequestConfig()).then(loadOwners)} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px', marginRight: '6px' }}>Approve</button>
                    <button onClick={() => api.put(`/auth/owners/${owner.ownerId}/status`, { status: 'Rejected' }, adminRequestConfig()).then(loadOwners)} style={{ padding: '4px 10px', fontSize: '12px', background: '#ffebee', color: '#e53935', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '6px' }}>Reject</button>
                    <button onClick={() => handleRemoveOwner(owner)} style={{ padding: '4px 10px', fontSize: '12px', background: '#ffebee', color: '#e53935', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {owners.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>No owners found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/users', adminRequestConfig())
      .then(res => setUsers(res.data.users || []))
      .catch(err => {
        console.error('Fetch users error:', err);
        alert(err.response?.data?.error || 'Failed to load users.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '28px', marginBottom: '30px' }}>Manage Users</h2>
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading users...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ margin: 0 }}>
            <thead><tr><th>#</th><th>Name</th><th>Age</th><th>Country</th><th>WhatsApp</th><th>Email</th></tr></thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user.userId}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: '600' }}>{user.fullName}</td>
                  <td>{user.age}</td>
                  <td>{user.country}</td>
                  <td>{user.whatsappNumber}</td>
                  <td>{user.email}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    api.get('/bookings', adminRequestConfig())
      .then(res => setBookings(res.data.bookings || []))
      .catch(err => console.error('Fetch bookings error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatus = async (id, status) => {
    try {
      const res = await api.put(`/bookings/${id}/status`, { status }, adminRequestConfig());
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      if (status === 'Approved' && res.data.emailNotification?.sent === false) {
        alert(`Booking approved, but email was not sent: ${res.data.emailNotification.reason || res.data.emailNotification.error || 'Email service unavailable.'}`);
      }
    } catch (err) {
      console.error('Booking status error:', err);
      alert(err.response?.data?.error || 'Failed to update booking.');
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '28px', marginBottom: '30px' }}>All Bookings</h2>
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading bookings...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ margin: 0 }}>
            <thead><tr><th>ID</th><th>Service</th><th>User</th><th>Date</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: '600' }}>{b.id.substring(0, 6)}</td>
                  <td>{b.serviceName}</td>
                  <td>{b.guestName || b.guestEmail || b.userEmail || 'Guest'}</td>
                  <td>{b.checkIn}</td>
                  <td>${b.totalPrice}</td>
                  <td><StatusBadge status={b.status} /></td>
                  <td>
                    <button onClick={() => handleStatus(b.id, 'Approved')} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px', marginRight: '6px' }}>Approve</button>
                    <button onClick={() => handleStatus(b.id, 'Rejected')} style={{ padding: '4px 10px', fontSize: '12px', background: '#ffebee', color: '#e53935', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Reject</button>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>No booking requests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    setLoading(true);
    const url = filterStatus === 'All' ? '/services' : `/services?status=${filterStatus}`;
    api.get(url, adminRequestConfig())
      .then(res => setServices(res.data.services || []))
      .catch(err => console.error('Fetch services error:', err))
      .finally(() => setLoading(false));
  }, [filterStatus]);

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/services/${id}`, { status }, adminRequestConfig());
      setServices(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    } catch (err) {
      console.error('Service status error:', err);
      alert(err.response?.data?.error || 'Failed to update service.');
    }
  };


  const handleRemoveService = async (service) => {
    if (!window.confirm(`Remove "${service.serviceName}"?`)) return;

    try {
      await api.delete(`/services/${service.id}`, adminRequestConfig());
      setServices(prev => prev.filter(s => s.id !== service.id));
    } catch (err) {
      console.error('Service remove error:', err);
      alert(err.response?.data?.error || 'Failed to remove service.');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px' }}>Manage Services</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
            <button 
              key={status}
              onClick={() => setFilterStatus(status)}
              className={filterStatus === status ? 'btn btn-primary' : 'btn btn-outline'}
              style={filterStatus === status ? {} : { background: 'white', color: '#333' }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading services...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ margin: 0 }}>
            <thead><tr><th>#</th><th>Service</th><th>Category</th><th>Owner</th><th>Price</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {services.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: '600' }}>{s.serviceName}</td>
                  <td>{s.category}</td>
                  <td>{s.ownerId || 'demo-owner'}</td>
                  <td>${s.price}</td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>
                    {String(s.status || '').trim().toLowerCase() === 'pending' && (
                      <>
                        <button onClick={() => handleStatus(s.id, 'Approved')} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px', marginRight: '6px' }}>Approve</button>
                        <button onClick={() => handleStatus(s.id, 'Rejected')} style={{ padding: '4px 10px', fontSize: '12px', background: '#ffebee', color: '#e53935', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '6px' }}>Reject</button>
                      </>
                    )}
                    <button onClick={() => handleRemoveService(s)} style={{ padding: '4px 10px', fontSize: '12px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Remove</button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>
                    {filterStatus === 'All' ? 'No services yet.' : `No ${filterStatus.toLowerCase()} services yet.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();
  const savedUser = session.user;
  const isAdmin = savedUser?.role === 'admin';
  const authToken = localStorage.getItem('authToken');
  const isDemoMode = !auth.currentUser && !authToken;

  if (savedUser && !isAdmin && !isDemoMode) {
    return (
      <div className="container section-padding" style={{ maxWidth: '640px' }}>
        <div className="card">
          <h1 style={{ fontSize: '28px', marginBottom: '16px' }}>Admin Access Required</h1>
          <p style={{ marginBottom: '16px' }}>
            You are currently signed in as <strong>{savedUser.role}</strong>. Only an admin account can access this dashboard.
          </p>
          <p style={{ marginBottom: '24px' }}>
            Please log out and sign in with the admin credentials, or use the demo admin flow in local development.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              clearSession();
              navigate('/login');
            }}
          >
            Logout and go to Login
          </button>
        </div>
      </div>
    );
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div style={{ padding: '0 24px 20px', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>A</div>
            <div>
              <p style={{ fontWeight: '600', fontSize: '14px' }}>Admin User</p>
              <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>Super Admin</p>
            </div>
          </div>
        </div>
        <div style={{ padding: '0 24px', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Admin Panel</h2>
        </div>
        <ul className="sidebar-nav">
          <li>
            <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
              <LayoutDashboard size={20} /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/admin/categories" className={isActive('/admin/categories') ? 'active' : ''}>
              <Tags size={20} /> Manage Categories
            </Link>
          </li>
          <li>
            <Link to="/admin/services" className={isActive('/admin/services') ? 'active' : ''}>
              <MapIcon size={20} /> Manage Services
            </Link>
          </li>
          <li>
            <Link to="/admin/owners" className={isActive('/admin/owners') ? 'active' : ''}>
              <Users size={20} /> Manage Owners
            </Link>
          </li>
          <li>
            <Link to="/admin/users" className={isActive('/admin/users') ? 'active' : ''}>
              <Users size={20} /> Manage Users
            </Link>
          </li>
          <li>
            <Link to="/admin/bookings" className={isActive('/admin/bookings') ? 'active' : ''}>
              <ClipboardList size={20} /> Manage Bookings
            </Link>
          </li>
          {/* Gallery and reviews management removed */}
          <li style={{ marginTop: '40px' }}>
            <Link to="/" style={{ color: '#e53935' }}>
              <LogOut size={20} /> Logout
            </Link>
          </li>
        </ul>
      </div>
      <div className="dashboard-content">
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="services" element={<ManageServices />} />
          <Route path="owners" element={<ManageOwners />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="bookings" element={<ManageBookings />} />
          {/* Gallery and reviews routes removed */}
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
