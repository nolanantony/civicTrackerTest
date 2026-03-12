import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminLogin } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await adminLogin(form);
      saveAuth(data.token, data.user);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link to="/" style={styles.back}>← Back to Home</Link>
        <div style={styles.iconWrap}>
          <span style={styles.icon}>🏛️</span>
        </div>
        <h1 style={styles.title}>Authority Login</h1>
        <p style={styles.subtitle}>Mangalore City Corporation · Admin Portal</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Official Email</label>
            <input
              type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="admin@mcc.gov.in" style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" style={styles.input}
            />
          </div>
          <button onClick={handleSubmit} disabled={loading} style={styles.btn}>
            {loading ? 'Authenticating...' : 'Login to Admin Panel'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
          Citizen? <Link to="/login" style={{ color: '#2563eb' }}>Login here →</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #006994 0%, #00a6c9 100%)', padding: '2rem'
  },
  card: {
    background: '#fff', borderRadius: '16px', padding: '2.5rem',
    width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
  },
  back: { color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' },
  iconWrap: { textAlign: 'center', margin: '1.5rem 0 0.5rem' },
  icon: { fontSize: '3rem' },
  title: {
    fontFamily: "'Playfair Display', serif", fontSize: '1.8rem',
    fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: '0.3rem'
  },
  subtitle: { color: '#6b7280', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.5rem' },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
    borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.9rem'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: { fontWeight: 600, fontSize: '0.9rem', color: '#374151' },
  input: {
    padding: '0.65rem 0.9rem', border: '1px solid #d1d5db',
    borderRadius: '8px', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit'
  },
  btn: {
    background: '#006994', color: '#fff', border: 'none',
    padding: '0.8rem', borderRadius: '8px', fontWeight: 700,
    fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem'
  }
};
