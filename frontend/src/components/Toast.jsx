import React, { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icon = { success: '✓', error: '✕', info: 'ℹ' }[type];

  return (
    <div className={`toast toast-${type}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{icon}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'inherit', marginLeft: 'auto', opacity: 0.7, fontSize: '1rem',
        }}
      >✕</button>
    </div>
  );
}
