import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Experts' },
    { to: '/my-bookings', label: 'My Bookings' },
  ];

  return (
    <nav style={{
      borderBottom: '1px solid var(--border)',
      background: 'rgba(10,10,15,0.9)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--accent)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
            boxShadow: '0 0 16px var(--accent-glow)',
          }}>⚡</div>
          <span style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: '1.2rem',
            color: 'var(--text-primary)',
          }}>ExpertConnect</span>
        </Link>

        <div style={{ display: 'flex', gap: 8 }}>
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                textDecoration: 'none',
                padding: '6px 16px',
                borderRadius: 99,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: location.pathname === link.to ? 'var(--accent-light)' : 'var(--text-secondary)',
                background: location.pathname === link.to ? 'var(--accent-glow)' : 'transparent',
                border: location.pathname === link.to ? '1px solid rgba(124,106,247,0.3)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
            >{link.label}</Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
