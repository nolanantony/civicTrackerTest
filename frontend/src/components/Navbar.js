import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        <span style={styles.brandIcon}>🗳️</span>
        <span style={styles.brandText}>MyVoice</span>
        <span style={styles.brandSub}>Mangalore</span>
      </Link>

      {/* Desktop nav */}
      <div style={styles.links}>
        <Link to="/" style={{ ...styles.link, ...(isActive('/') ? styles.activeLink : {}) }}>Home</Link>
        <Link to="/complaints" style={{ ...styles.link, ...(isActive('/complaints') ? styles.activeLink : {}) }}>View Complaints</Link>

        {user ? (
          <>
            <Link to="/file-complaint" style={styles.btnPrimary}>+ File Complaint</Link>
            {isAdmin && (
              <Link to="/admin" style={{ ...styles.link, color: '#f59e0b' }}>Admin Panel</Link>
            )}
            <div style={styles.userMenu}>
              <span style={styles.userName}>👤 {user.name.split(' ')[0]}</span>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/signup" style={styles.btnPrimary}>Sign Up</Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>☰</button>

      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/complaints" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>View Complaints</Link>
          {user ? (
            <>
              <Link to="/file-complaint" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>File Complaint</Link>
              {isAdmin && <Link to="/admin" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={styles.mobileLinkBtn}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 2rem', height: '64px',
    background: '#fff', borderBottom: '1px solid #e5e7eb',
    position: 'sticky', top: 0, zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: '6px',
    textDecoration: 'none', color: '#111'
  },
  brandIcon: { fontSize: '1.4rem' },
  brandText: { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.2rem', color: '#1e3a8a' },
  brandSub: { fontSize: '0.7rem', color: '#6b7280', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' },
  links: { display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' },
  link: {
    textDecoration: 'none', color: '#374151', fontWeight: 500, fontSize: '0.9rem',
    padding: '4px 0', borderBottom: '2px solid transparent', transition: 'all 0.2s'
  },
  activeLink: { color: '#2563eb', borderBottom: '2px solid #2563eb' },
  btnPrimary: {
    textDecoration: 'none', background: '#2563eb', color: '#fff',
    padding: '0.45rem 1.1rem', borderRadius: '6px', fontWeight: 600,
    fontSize: '0.9rem', transition: 'background 0.2s'
  },
  userMenu: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  userName: { fontSize: '0.9rem', color: '#374151', fontWeight: 500 },
  logoutBtn: {
    background: 'none', border: '1px solid #e5e7eb', color: '#6b7280',
    padding: '0.3rem 0.8rem', borderRadius: '6px', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: 500
  },
  hamburger: {
    display: 'none', background: 'none', border: 'none',
    fontSize: '1.5rem', cursor: 'pointer',
    '@media(max-width:768px)': { display: 'block' }
  },
  mobileMenu: {
    position: 'absolute', top: '64px', left: 0, right: 0,
    background: '#fff', borderBottom: '1px solid #e5e7eb',
    display: 'flex', flexDirection: 'column', padding: '1rem 2rem', gap: '0.8rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  },
  mobileLink: { textDecoration: 'none', color: '#374151', fontWeight: 500, padding: '4px 0' },
  mobileLinkBtn: {
    background: 'none', border: 'none', color: '#ef4444',
    fontWeight: 500, padding: '4px 0', cursor: 'pointer', textAlign: 'left'
  }
};
