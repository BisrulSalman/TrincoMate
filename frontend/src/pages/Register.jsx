import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { roleHome, saveSession } from '../services/auth';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('user');
  const [form, setForm] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', { ...form, role });
      setMessage(res.data.message);
      if (role === 'user' && res.data.token) {
        saveSession({ token: res.data.token, user: res.data.user, role: res.data.role || role });
        setTimeout(() => navigate(roleHome(role)), 800);
      } else {
        setTimeout(() => navigate('/login'), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section-padding" style={{ maxWidth: '720px' }}>
      <div className="card">
        <h1 style={{ fontSize: '30px', marginBottom: '8px' }}>Register</h1>
        <p style={{ marginBottom: '24px' }}>Create an Owner or User account.</p>
        {message && <p style={{ color: '#059669', marginBottom: '14px' }}>{message}</p>}
        {error && <p style={{ color: '#dc2626', marginBottom: '14px' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Register As</label>
            <select value={role} onChange={e => { setRole(e.target.value); setForm({}); }}>
              <option value="owner">Owner</option>
              <option value="user">User</option>
            </select>
          </div>

          {role === 'owner' ? (
            <>
              <div className="input-group"><label>Owner Name</label><input required onChange={e => update('ownerName', e.target.value)} /></div>
              <div className="input-group"><label>Service Name</label><input required onChange={e => update('serviceName', e.target.value)} /></div>
              <div className="input-group"><label>Phone Number</label><input required onChange={e => update('phoneNumber', e.target.value)} /></div>
            </>
          ) : (
            <>
              <div className="input-group"><label>Full Name</label><input required onChange={e => update('fullName', e.target.value)} /></div>
              <div className="input-group"><label>Age</label><input type="number" required onChange={e => update('age', e.target.value)} /></div>
              <div className="input-group"><label>Country</label><input required onChange={e => update('country', e.target.value)} /></div>
              <div className="input-group"><label>WhatsApp Number</label><input required onChange={e => update('whatsappNumber', e.target.value)} /></div>
            </>
          )}

          <div className="input-group"><label>Email Address</label><input type="email" required onChange={e => update('email', e.target.value)} /></div>
          <div className="grid-2">
            <div className="input-group"><label>Password</label><input type="password" required onChange={e => update('password', e.target.value)} /></div>
            <div className="input-group"><label>Confirm Password</label><input type="password" required onChange={e => update('confirmPassword', e.target.value)} /></div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p style={{ marginTop: '18px' }}>Already registered? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Login</Link></p>
      </div>
    </div>
  );
};

export default Register;
