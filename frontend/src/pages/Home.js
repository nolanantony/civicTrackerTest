import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '📄', color: '#dbeafe', label: 'Easy Filing', desc: 'Report issues quickly with our simple complaint form.' },
  { icon: '👥', color: '#dcfce7', label: 'Community Support', desc: 'Like and support complaints that matter to you.' },
  { icon: '📈', color: '#fef3c7', label: 'Track Progress', desc: 'Monitor the status of complaints in real-time.' },
  { icon: '🛡️', color: '#ede9fe', label: 'Transparency', desc: 'Hold authorities accountable with public tracking.' },
];

const STATS = [
  { value: '500+', label: 'Issues Filed' },
  { value: '120+', label: 'Resolved' },
  { value: '2,000+', label: 'Community Votes' },
  { value: '6', label: 'Categories' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={styles.page}>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroBadge}>🏙️ Mangalore Civic Platform</div>
        <h1 style={styles.heroTitle}>Your Voice Matters</h1>
        <p style={styles.heroSub}>
          A platform to track and report civic issues in Mangalore. File complaints,
          support community issues, and hold local authorities accountable.
        </p>
        <div style={styles.heroButtons}>
          <Link to={user ? '/file-complaint' : '/signup'} style={styles.btnPrimary}>
            {user ? '+ File a Complaint' : 'Get Started'}
          </Link>
          <Link to="/complaints" style={styles.btnOutline}>View Complaints →</Link>
        </div>
      </section>

      {/* Stats */}
      <section style={styles.statsRow}>
        {STATS.map((s) => (
          <div key={s.label} style={styles.statItem}>
            <div style={styles.statValue}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>Why Use MyVoice?</h2>
        <div style={styles.featureGrid}>
          {FEATURES.map((f) => (
            <div key={f.label} style={styles.featureCard}>
              <div style={{ ...styles.featureIcon, background: f.color }}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.label}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={styles.cta}>
          <h2 style={styles.ctaTitle}>Ready to make a difference?</h2>
          <p style={styles.ctaSub}>Join thousands of Mangaloreans actively improving their city.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={styles.btnPrimary}>Create Account</Link>
            <Link to="/login" style={{ ...styles.btnOutline, borderColor: '#fff', color: '#fff' }}>Login</Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2025 MyVoice · Mangalore Civic Issue Tracker</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
          <Link to="/complaints" style={styles.footerLink}>Complaints</Link>
          <Link to="/admin/login" style={styles.footerLink}>Authority Login</Link>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#fff' },
  hero: {
    textAlign: 'center', padding: '5rem 2rem 4rem',
    background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)'
  },
  heroBadge: {
    display: 'inline-block', background: '#dbeafe', color: '#1d4ed8',
    fontSize: '0.8rem', fontWeight: 600, padding: '0.3rem 0.8rem',
    borderRadius: '20px', marginBottom: '1rem', letterSpacing: '0.02em'
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: 800, color: '#0f172a', marginBottom: '1rem', lineHeight: 1.2
  },
  heroSub: {
    fontSize: '1.1rem', color: '#475569', maxWidth: '600px',
    margin: '0 auto 2rem', lineHeight: 1.7
  },
  heroButtons: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
  btnPrimary: {
    textDecoration: 'none', background: '#2563eb', color: '#fff',
    padding: '0.75rem 1.8rem', borderRadius: '8px', fontWeight: 700,
    fontSize: '1rem', boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
    transition: 'all 0.2s'
  },
  btnOutline: {
    textDecoration: 'none', background: 'transparent',
    border: '2px solid #d1d5db', color: '#374151',
    padding: '0.75rem 1.8rem', borderRadius: '8px', fontWeight: 600, fontSize: '1rem'
  },
  statsRow: {
    display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
    gap: '2rem', padding: '2.5rem 2rem', background: '#1e3a8a'
  },
  statItem: { textAlign: 'center', color: '#fff' },
  statValue: { fontSize: '2rem', fontWeight: 800, fontFamily: "'Playfair Display', serif" },
  statLabel: { fontSize: '0.85rem', color: '#93c5fd', marginTop: '4px' },
  features: { padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' },
  sectionTitle: {
    textAlign: 'center', fontSize: '1.8rem', fontWeight: 700,
    color: '#0f172a', marginBottom: '3rem',
    fontFamily: "'Playfair Display', serif"
  },
  featureGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem'
  },
  featureCard: {
    padding: '2rem', borderRadius: '16px',
    border: '1px solid #f1f5f9', textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'transform 0.2s'
  },
  featureIcon: {
    fontSize: '2rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '60px', height: '60px', borderRadius: '50%', marginBottom: '1rem'
  },
  featureTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '0.5rem' },
  featureDesc: { color: '#6b7280', fontSize: '0.93rem', lineHeight: 1.6 },
  cta: {
    textAlign: 'center', padding: '5rem 2rem',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
    color: '#fff'
  },
  ctaTitle: { fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', fontFamily: "'Playfair Display', serif" },
  ctaSub: { fontSize: '1.05rem', color: '#bfdbfe', marginBottom: '2rem' },
  footer: { textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '0.9rem', background: '#f9fafb' },
  footerLink: { color: '#6b7280', textDecoration: 'none', fontSize: '0.85rem' }
};
