import React from 'react';
import { Link } from 'react-router-dom';

const CATEGORY_COLORS = {
  Technology: '#7c6af7',
  Business: '#f0b429',
  Finance: '#22c55e',
  Healthcare: '#06b6d4',
  Legal: '#f59e0b',
  Marketing: '#ec4899',
  Design: '#8b5cf6',
  Education: '#3b82f6',
  Psychology: '#10b981',
  Career: '#f97316',
};

const renderStars = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
};

export default function ExpertCard({ expert, index = 0 }) {
  const catColor = CATEGORY_COLORS[expert.category] || 'var(--accent)';

  return (
    <Link
      to={`/experts/${expert._id}`}
      style={{ textDecoration: 'none' }}
    >
      <div
        className="card fade-up"
        style={{
          padding: '24px',
          cursor: 'pointer',
          animationDelay: `${index * 60}ms`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle top border accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${catColor}88, transparent)`,
        }} />

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {/* Avatar */}
          <div style={{
            width: 52, height: 52, borderRadius: 12,
            background: `${catColor}22`,
            border: `2px solid ${catColor}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 700, color: catColor,
            flexShrink: 0,
          }}>
            {expert.avatar || expert.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <h3 style={{
                fontSize: '1rem',
                fontFamily: 'DM Serif Display, serif',
                color: 'var(--text-primary)',
                margin: 0,
              }}>{expert.name}</h3>
              <span
                className="badge"
                style={{
                  background: `${catColor}18`,
                  color: catColor,
                  flexShrink: 0,
                  fontSize: '0.68rem',
                }}
              >{expert.category}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
              <span style={{ color: 'var(--gold)', fontSize: '0.8rem' }}>
                {renderStars(expert.rating)}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                {expert.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {expert.bio && (
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            marginTop: 14,
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{expert.bio}</p>
        )}

        {/* Footer stats */}
        <div style={{
          display: 'flex',
          gap: 16,
          marginTop: 16,
          paddingTop: 14,
          borderTop: '1px solid var(--border)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
        }}>
          <span>📅 {expert.experience}y exp</span>
          <span>🎯 {expert.totalSessions} sessions</span>
          <span style={{ marginLeft: 'auto', color: 'var(--accent-light)', fontWeight: 600 }}>
            ${expert.hourlyRate}/hr
          </span>
        </div>
      </div>
    </Link>
  );
}
