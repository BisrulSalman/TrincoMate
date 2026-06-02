import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { roleHome, saveSession } from '../services/auth';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', loginAs: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', form);
      saveSession({ token: res.data.token, user: res.data.user, role: res.data.role || form.loginAs });
      navigate(roleHome(res.data.role || form.loginAs));
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section-padding" style={{ maxWidth: '520px' }}>
      <div className="card">
        <h1 style={{ fontSize: '30px', marginBottom: '8px' }}>Login</h1>
        <p style={{ marginBottom: '24px' }}>Use one login for Admin, Owner, and User access.</p>
        {error && <p style={{ color: '#dc2626', marginBottom: '14px' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Login As</label>
            <select value={form.loginAs} onChange={e => setForm({ ...form, loginAs: e.target.value })}>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
              <option value="user">User</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <p style={{ marginTop: '18px' }}>No account? <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Register</Link></p>
        <p style={{ marginTop: '8px', fontSize: '13px' }}>Default admin: admin@trincomate.com / Admin@12345</p>
      </div>
    </div>
  );
};

export default Login;
