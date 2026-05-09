import React, { useState } from 'react';
import { fetchBookingsByEmail } from '../utils/api';

const STATUS_BADGES = {
  Pending: 'badge-orange',
  Confirmed: 'badge-green',
  Completed: 'badge-purple',
  Cancelled: 'badge-gray',
};

const STATUS_ICONS = {
  Pending: '⏳',
  Confirmed: '✓',
  Completed: '🎉',
  Cancelled: '✕',
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (t) => {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

export default function MyBookings() {
  const [email, setEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = emailInput.trim();
    if (!trimmed || !/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);
    setEmail(trimmed);

    try {
      const res = await fetchBookingsByEmail(trimmed);
      setBookings(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const groupedByStatus = {
    Confirmed: bookings.filter(b => b.status === 'Confirmed'),
    Pending: bookings.filter(b => b.status === 'Pending'),
    Completed: bookings.filter(b => b.status === 'Completed'),
    Cancelled: bookings.filter(b => b.status === 'Cancelled'),
  };

  return (
    <div className="page-wrapper" style={{ paddingTop: 40 }}>
      <div style={{ marginBottom: 36 }}>
        <p className="section-label">My Sessions</p>
        <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>My Bookings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Enter your email to view all your booked sessions.
        </p>
      </div>

      {/* Email Search */}
      <div className="card" style={{ padding: 28, marginBottom: 32 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <input
              type="email"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Loading...</>
            ) : 'Find Bookings'}
          </button>
        </form>
        {error && <p className="field-error" style={{ marginTop: 8 }}>{error}</p>}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      )}

      {/* Results */}
      {!loading && searched && (
        <>
          {bookings.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📭</div>
              <h3 style={{ marginBottom: 8 }}>No bookings found</h3>
              <p>No sessions found for <strong>{email}</strong>.</p>
            </div>
          ) : (
            <>
              {/* Stats row */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
                {Object.entries(STATUS_BADGES).map(([status, badge]) => {
                  const count = groupedByStatus[status]?.length || 0;
                  if (count === 0) return null;
                  return (
                    <div
                      key={status}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 18px',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}
                    >
                      <span>{STATUS_ICONS[status]}</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{count}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{status}</span>
                    </div>
                  );
                })}
              </div>

              {/* Bookings list grouped by status */}
              {['Confirmed', 'Pending', 'Completed', 'Cancelled'].map(status => {
                const group = groupedByStatus[status];
                if (!group || group.length === 0) return null;
                return (
                  <div key={status} style={{ marginBottom: 32 }}>
                    <h3 style={{
                      fontSize: '0.9rem', fontFamily: 'Sora, sans-serif',
                      color: 'var(--text-secondary)', marginBottom: 12,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      {STATUS_ICONS[status]} {status}
                      <span style={{
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        borderRadius: 99, padding: '1px 8px', fontSize: '0.72rem',
                      }}>{group.length}</span>
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {group.map(booking => (
                        <div key={booking._id} className="card" style={{ padding: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                <h3 style={{ fontSize: '1rem', fontFamily: 'DM Serif Display, serif' }}>
                                  {booking.expertName}
                                </h3>
                                <span className={`badge ${STATUS_BADGES[booking.status]}`}>
                                  {booking.status}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                <span>📅 {formatDate(booking.date)}</span>
                                <span>🕐 {formatTime(booking.timeSlot)}</span>
                                {booking.expertId?.category && (
                                  <span>📋 {booking.expertId.category}</span>
                                )}
                              </div>
                              {booking.notes && (
                                <p style={{
                                  marginTop: 10, fontSize: '0.82rem',
                                  color: 'var(--text-muted)', fontStyle: 'italic',
                                }}>
                                  "{booking.notes}"
                                </p>
                              )}
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Booked {new Date(booking.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </>
      )}
    </div>
  );
}
