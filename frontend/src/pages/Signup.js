import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      const { data } = await signup(form);
      saveAuth(data.token, data.user);
      navigate('/complaints', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link to="/" style={styles.backLink}>← Back to Home</Link>
        <div style={styles.header}>
          <div style={styles.icon}>🗳️</div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join MyVoice and make Mangalore better</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" style={styles.input} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" style={styles.input} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Min 6 characters" style={styles.input} />
          </div>
          <button onClick={handleSubmit} disabled={loading} style={styles.btn}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </div>

        <p style={styles.switchText}>
          Already have an account? <Link to="/login" style={styles.switchLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', padding: '2rem'
  },
  card: {
    background: '#fff', borderRadius: '16px', padding: '2.5rem',
    width: '100%', maxWidth: '420px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
  },
  backLink: { color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' },
  header: { textAlign: 'center', margin: '1.5rem 0' },
  icon: { fontSize: '2.5rem', marginBottom: '0.5rem' },
  title: { fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' },
  subtitle: { color: '#6b7280', fontSize: '0.95rem' },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
    borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.9rem'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: { fontWeight: 600, fontSize: '0.9rem', color: '#374151' },
  input: {
    padding: '0.65rem 0.9rem', border: '1px solid #d1d5db', borderRadius: '8px',
    fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit'
  },
  btn: {
    background: '#2563eb', color: '#fff', border: 'none',
    padding: '0.8rem', borderRadius: '8px', fontWeight: 700,
    fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem'
  },
  switchText: { textAlign: 'center', marginTop: '1.5rem', color: '#6b7280', fontSize: '0.9rem' },
  switchLink: { color: '#2563eb', fontWeight: 600, textDecoration: 'none' }
};
