import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getComplaints, supportComplaint } from '../api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Road & Infrastructure', 'Garbage & Sanitation', 'Water Supply', 'Street Lights', 'Public Safety', 'Other'];
const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];

const STATUS_COLORS = {
  'Pending': { bg: '#fef3c7', text: '#92400e' },
  'In Progress': { bg: '#dbeafe', text: '#1e40af' },
  'Resolved': { bg: '#dcfce7', text: '#166534' },
  'Rejected': { bg: '#fee2e2', text: '#991b1b' },
};

export default function ViewComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ category: 'All', status: 'All', search: '', sort: '-createdAt' });
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1 });
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchComplaints = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 9, sort: filters.sort };
      if (filters.category !== 'All') params.category = filters.category;
      if (filters.status !== 'All') params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const { data } = await getComplaints(params);
      setComplaints(data.complaints);
      setPagination({ total: data.total, pages: data.pages, currentPage: data.currentPage });
    } catch (err) {
      setError('Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchComplaints(1); }, [fetchComplaints]);

  const handleSupport = async (id) => {
    if (!user) { navigate('/login'); return; }
    try {
      const { data } = await supportComplaint(id);
      setComplaints(prev => prev.map(c =>
        c._id === id ? { ...c, supportCount: data.supportCount, supported: data.supported } : c
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Error supporting complaint.');
    }
  };

  const handleFilterChange = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Community Complaints</h1>
        <p style={styles.subtitle}>Browse and support civic issues in Mangalore</p>
        {user && <Link to="/file-complaint" style={styles.fileBtn}>+ File a Complaint</Link>}
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input
          placeholder="🔍 Search complaints..."
          value={filters.search}
          onChange={e => handleFilterChange('search', e.target.value)}
          style={styles.searchInput}
        />
        <select value={filters.category} onChange={e => handleFilterChange('category', e.target.value)} style={styles.select}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} style={styles.select}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.sort} onChange={e => handleFilterChange('sort', e.target.value)} style={styles.select}>
          <option value="-createdAt">Newest First</option>
          <option value="createdAt">Oldest First</option>
          <option value="-supportCount">Most Supported</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div style={styles.loading}>Loading complaints...</div>
      ) : error ? (
        <div style={styles.errorBox}>{error}</div>
      ) : complaints.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <p>No complaints found. <Link to="/file-complaint" style={{ color: '#2563eb' }}>Be the first to file one!</Link></p>
        </div>
      ) : (
        <>
          <p style={styles.countText}>{pagination.total} complaint{pagination.total !== 1 ? 's' : ''} found</p>
          <div style={styles.grid}>
            {complaints.map(c => {
              const statusStyle = STATUS_COLORS[c.status] || STATUS_COLORS['Pending'];
              return (
                <div key={c._id} style={styles.card}>
                  {c.image && (
                    <img
                      src={`http://localhost:5000${c.image}`}
                      alt="complaint"
                      style={styles.cardImage}
                    />
                  )}
                  <div style={styles.cardBody}>
                    <div style={styles.cardMeta}>
                      <span style={styles.badge}>{c.category}</span>
                      <span style={{ ...styles.statusBadge, background: statusStyle.bg, color: statusStyle.text }}>
                        {c.status}
                      </span>
                    </div>
                    <h3 style={styles.cardTitle}>{c.title}</h3>
                    <p style={styles.cardDesc}>{c.description.slice(0, 100)}{c.description.length > 100 ? '...' : ''}</p>
                    <div style={styles.cardFooter}>
                      <span style={styles.cardInfo}>📍 {c.location}</span>
                      <span style={styles.cardInfo}>👤 {c.userName}</span>
                      <span style={styles.cardInfo}>🗓️ {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button
                      onClick={() => handleSupport(c._id)}
                      style={styles.supportBtn}
                    >
                      👍 Support ({c.supportCount || 0})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={styles.pagination}>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => fetchComplaints(p)}
                  style={{ ...styles.pageBtn, ...(p === pagination.currentPage ? styles.pageBtnActive : {}) }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: '1200px', margin: '0 auto', padding: '2rem' },
  header: { textAlign: 'center', marginBottom: '2rem' },
  title: { fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 800, color: '#0f172a' },
  subtitle: { color: '#6b7280', marginBottom: '1rem' },
  fileBtn: {
    display: 'inline-block', background: '#2563eb', color: '#fff',
    textDecoration: 'none', padding: '0.6rem 1.4rem', borderRadius: '8px', fontWeight: 600
  },
  filters: {
    display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
    marginBottom: '2rem', background: '#f8fafc', padding: '1rem',
    borderRadius: '12px', border: '1px solid #e2e8f0'
  },
  searchInput: {
    flex: '1 1 200px', padding: '0.6rem 0.9rem', border: '1px solid #d1d5db',
    borderRadius: '8px', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit'
  },
  select: {
    padding: '0.6rem 0.9rem', border: '1px solid #d1d5db', borderRadius: '8px',
    fontSize: '0.9rem', outline: 'none', background: '#fff', fontFamily: 'inherit'
  },
  loading: { textAlign: 'center', padding: '4rem', color: '#6b7280', fontSize: '1.1rem' },
  errorBox: { background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '8px', textAlign: 'center' },
  empty: { textAlign: 'center', padding: '4rem', color: '#6b7280' },
  countText: { color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
  card: {
    background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb',
    overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  cardImage: { width: '100%', height: '160px', objectFit: 'cover' },
  cardBody: { padding: '1.25rem' },
  cardMeta: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' },
  badge: {
    background: '#dbeafe', color: '#1d4ed8', fontSize: '0.75rem',
    padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 600
  },
  statusBadge: {
    fontSize: '0.75rem', padding: '0.2rem 0.6rem',
    borderRadius: '20px', fontWeight: 600
  },
  cardTitle: { fontWeight: 700, color: '#1e3a8a', marginBottom: '0.5rem', fontSize: '1rem' },
  cardDesc: { color: '#4b5563', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '0.75rem' },
  cardFooter: { display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.75rem' },
  cardInfo: { fontSize: '0.8rem', color: '#9ca3af' },
  supportBtn: {
    background: '#2563eb', color: '#fff', border: 'none',
    padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer',
    fontWeight: 600, fontSize: '0.85rem', width: '100%'
  },
  pagination: { display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem' },
  pageBtn: {
    width: '36px', height: '36px', border: '1px solid #d1d5db',
    borderRadius: '8px', cursor: 'pointer', background: '#fff',
    fontWeight: 600, fontSize: '0.9rem'
  },
  pageBtnActive: { background: '#2563eb', color: '#fff', border: '1px solid #2563eb' }
};
