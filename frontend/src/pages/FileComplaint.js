import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fileComplaint } from '../api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Road & Infrastructure', 'Garbage & Sanitation', 'Water Supply', 'Street Lights', 'Public Safety', 'Other'];

export default function FileComplaint() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', location: '', category: ''
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.description || !form.location || !form.category) {
      return setError('Please fill in all required fields.');
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (image) formData.append('image', image);

      await fileComplaint(formData);
      setSuccess('Your complaint has been filed successfully!');
      setTimeout(() => navigate('/complaints'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to file complaint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Report a Civic Issue</h1>
          <p style={styles.subtitle}>
            Filing as <strong>{user?.name}</strong> · Your voice helps improve Mangalore
          </p>
        </div>

        {error && <div style={styles.errorBox}>⚠️ {error}</div>}
        {success && <div style={styles.successBox}>✅ {success}</div>}

        <div style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Issue Title *</label>
              <input
                name="title" value={form.title} onChange={handleChange}
                placeholder="E.g., Potholes on MG Road"
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Category *</label>
              <select name="category" value={form.category} onChange={handleChange} style={styles.input}>
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Location *</label>
            <input
              name="location" value={form.location} onChange={handleChange}
              placeholder="Enter location or landmark (e.g., Near KSRTC Bus Stand)"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description *</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              rows={5} placeholder="Describe the issue in detail — what, where, how severe..."
              style={{ ...styles.input, resize: 'vertical' }}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Attach Image (optional)</label>
            <input type="file" accept="image/*" onChange={handleImage} style={{ fontSize: '0.9rem' }} />
            {preview && (
              <img src={preview} alt="preview" style={styles.imgPreview} />
            )}
          </div>

          <button onClick={handleSubmit} disabled={loading} style={styles.btn}>
            {loading ? 'Submitting...' : '📨 Submit Complaint'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', background: '#f8fafc',
    padding: '2rem', display: 'flex', justifyContent: 'center'
  },
  container: {
    background: '#fff', borderRadius: '16px', padding: '2.5rem',
    width: '100%', maxWidth: '680px', height: 'fit-content',
    boxShadow: '0 4px 20px rgba(0,0,0,0.07)'
  },
  header: { marginBottom: '2rem' },
  title: { fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' },
  subtitle: { color: '#6b7280', fontSize: '0.95rem' },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
    borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.9rem'
  },
  successBox: {
    background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534',
    borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.9rem'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: { fontWeight: 600, fontSize: '0.9rem', color: '#374151' },
  input: {
    padding: '0.65rem 0.9rem', border: '1px solid #d1d5db', borderRadius: '8px',
    fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.2s'
  },
  imgPreview: { marginTop: '0.75rem', width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' },
  btn: {
    background: '#2563eb', color: '#fff', border: 'none',
    padding: '0.9rem', borderRadius: '10px', fontWeight: 700,
    fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem'
  }
};
