import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchExpertById } from '../utils/api';
import { useSocket } from '../context/SocketContext';

const CATEGORY_COLORS = {
  Technology: '#7c6af7', Business: '#f0b429', Finance: '#22c55e',
  Healthcare: '#06b6d4', Legal: '#f59e0b', Marketing: '#ec4899',
  Design: '#8b5cf6', Education: '#3b82f6', Psychology: '#10b981', Career: '#f97316',
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
};

const formatTime = (t) => {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

export default function ExpertDetail() {
  const { id } = useParams();
  const socketRef = useSocket();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [realtimeUpdate, setRealtimeUpdate] = useState(null);

  const loadExpert = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchExpertById(id);
      setExpert(res.data);
      if (res.data.availability?.length > 0) {
        setSelectedDate(res.data.availability[0].date);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load expert details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadExpert(); }, [loadExpert]);

  // Real-time socket
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket || !id) return;

    socket.emit('join-expert-room', id);

    const handleSlotBooked = ({ date, timeSlot }) => {
      setExpert(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        updated.availability = updated.availability.map(avail => {
          if (avail.date !== date) return avail;
          return {
            ...avail,
            slots: avail.slots.map(slot =>
              slot.time === timeSlot ? { ...slot, isBooked: true } : slot
            ),
          };
        });
        return updated;
      });
      setRealtimeUpdate(`Slot ${formatTime(timeSlot)} was just booked!`);
      setTimeout(() => setRealtimeUpdate(null), 4000);
    };

    const handleSlotFreed = ({ date, timeSlot }) => {
      setExpert(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        updated.availability = updated.availability.map(avail => {
          if (avail.date !== date) return avail;
          return {
            ...avail,
            slots: avail.slots.map(slot =>
              slot.time === timeSlot ? { ...slot, isBooked: false } : slot
            ),
          };
        });
        return updated;
      });
    };

    socket.on('slot-booked', handleSlotBooked);
    socket.on('slot-freed', handleSlotFreed);

    return () => {
      socket.emit('leave-expert-room', id);
      socket.off('slot-booked', handleSlotBooked);
      socket.off('slot-freed', handleSlotFreed);
    };
  }, [id, socketRef]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  if (error) return (
    <div className="page-wrapper" style={{ paddingTop: 40, textAlign: 'center' }}>
      <p style={{ color: 'var(--error)', marginBottom: 16 }}>{error}</p>
      <Link className="btn btn-ghost" to="/">← Back to Experts</Link>
    </div>
  );

  if (!expert) return null;

  const catColor = CATEGORY_COLORS[expert.category] || 'var(--accent)';
  const selectedAvail = expert.availability?.find(a => a.date === selectedDate);
  const availableCount = selectedAvail?.slots?.filter(s => !s.isBooked).length || 0;

  return (
    <div className="page-wrapper" style={{ paddingTop: 32 }}>
      {/* Realtime notice */}
      {realtimeUpdate && (
        <div style={{
          background: 'rgba(245,158,11,0.1)', border: '1px solid var(--warning)',
          borderRadius: 'var(--radius-sm)', padding: '10px 16px',
          color: 'var(--warning)', fontSize: '0.85rem',
          marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          🔔 {realtimeUpdate}
        </div>
      )}

      <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        ← Back to Experts
      </Link>

      {/* Expert Header */}
      <div className="card" style={{ padding: 32, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 16,
            background: `${catColor}22`, border: `2px solid ${catColor}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700, color: catColor, flexShrink: 0,
          }}>
            {expert.avatar || expert.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>{expert.name}</h1>
                <span className="badge" style={{ background: `${catColor}18`, color: catColor }}>
                  {expert.category}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-light)' }}>
                  ${expert.hourlyRate}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/hr</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--gold)' }}>★ {expert.rating.toFixed(1)}</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                📅 {expert.experience} years exp
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                🎯 {expert.totalSessions} sessions
              </div>
            </div>

            {expert.bio && (
              <p style={{ color: 'var(--text-secondary)', marginTop: 16, lineHeight: 1.7, fontSize: '0.9rem' }}>
                {expert.bio}
              </p>
            )}

            {expert.specializations?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                {expert.specializations.map(s => (
                  <span key={s} className="badge badge-gray">{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Availability */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.3rem' }}>Available Sessions</h2>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
          Live updates enabled
        </span>
      </div>

      {expert.availability?.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📅</div>
          <p>No available slots right now. Check back soon!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, alignItems: 'start' }}>
          {/* Date selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {expert.availability.map(avail => {
              const free = avail.slots.filter(s => !s.isBooked).length;
              const isSelected = avail.date === selectedDate;
              return (
                <button
                  key={avail.date}
                  onClick={() => setSelectedDate(avail.date)}
                  style={{
                    background: isSelected ? 'var(--accent-glow)' : 'var(--bg-card)',
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontFamily: 'Sora, sans-serif',
                    fontSize: '0.82rem',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{formatDate(avail.date)}</div>
                  <div style={{ fontSize: '0.72rem', color: free > 0 ? 'var(--success)' : 'var(--error)' }}>
                    {free > 0 ? `${free} slots free` : 'Fully booked'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Slots grid */}
          <div className="card" style={{ padding: 24 }}>
            {selectedDate && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{formatDate(selectedDate)}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    {availableCount} of {selectedAvail?.slots?.length} slots available
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                  {selectedAvail?.slots?.map(slot => (
                    <div
                      key={slot.time}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${slot.isBooked ? 'var(--border)' : 'rgba(124,106,247,0.4)'}`,
                        background: slot.isBooked ? 'var(--bg)' : 'rgba(124,106,247,0.08)',
                        opacity: slot.isBooked ? 0.4 : 1,
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        color: slot.isBooked ? 'var(--text-muted)' : 'var(--accent-light)',
                        position: 'relative',
                      }}
                    >
                      {formatTime(slot.time)}
                      {slot.isBooked && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>Booked</div>
                      )}
                    </div>
                  ))}
                </div>

                {availableCount > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <Link
                      to={`/book/${expert._id}?date=${selectedDate}`}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      Book a Session →
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
