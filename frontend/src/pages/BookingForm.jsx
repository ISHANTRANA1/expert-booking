import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { fetchExpertById, createBooking } from '../utils/api';

const formatTime = (t) => {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};

const validate = (fields) => {
  const errors = {};
  if (!fields.clientName.trim() || fields.clientName.trim().length < 2)
    errors.clientName = 'Name must be at least 2 characters';
  if (!fields.clientEmail.trim() || !/^\S+@\S+\.\S+$/.test(fields.clientEmail))
    errors.clientEmail = 'Please enter a valid email address';
  if (!fields.clientPhone.trim() || !/^[+\d\s\-()\d]{7,20}$/.test(fields.clientPhone))
    errors.clientPhone = 'Please enter a valid phone number';
  if (!fields.date) errors.date = 'Please select a date';
  if (!fields.timeSlot) errors.timeSlot = 'Please select a time slot';
  if (fields.notes && fields.notes.length > 500)
    errors.notes = 'Notes cannot exceed 500 characters';
  return errors;
};

export default function BookingForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const preselectedDate = searchParams.get('date') || '';

  const [fields, setFields] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    date: preselectedDate,
    timeSlot: '',
    notes: '',
  });

  useEffect(() => {
    fetchExpertById(id)
      .then(res => {
        setExpert(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields(f => ({ ...f, [name]: value }));
    // Clear error on change
    if (validationErrors[name]) {
      setValidationErrors(e => { const n = { ...e }; delete n[name]; return n; });
    }
    // Reset time slot when date changes
    if (name === 'date') setFields(f => ({ ...f, date: value, timeSlot: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const errors = validate(fields);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({ expertId: id, ...fields });
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed. Please try again.';
      const apiErrs = err.response?.data?.errors;
      if (apiErrs) {
        const fieldErrors = {};
        apiErrs.forEach(e => { fieldErrors[e.field] = e.message; });
        setValidationErrors(fieldErrors);
      } else {
        setApiError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  if (success) return (
    <div className="page-wrapper" style={{ paddingTop: 80, maxWidth: 520 }}>
      <div className="card" style={{ padding: 48, textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(34,197,94,0.1)', border: '2px solid var(--success)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', margin: '0 auto 24px',
        }}>✓</div>
        <h2 style={{ marginBottom: 12, fontSize: '1.5rem' }}>Booking Confirmed!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
          Your session with <strong style={{ color: 'var(--text-primary)' }}>{expert?.name}</strong> has been booked.
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 8 }}>
          📅 {formatDate(fields.date)}
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 32 }}>
          🕐 {formatTime(fields.timeSlot)}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 32 }}>
          A confirmation will be sent to <strong>{fields.clientEmail}</strong>
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/my-bookings" className="btn btn-primary">View My Bookings</Link>
          <Link to="/" className="btn btn-ghost">Browse More Experts</Link>
        </div>
      </div>
    </div>
  );

  const selectedAvail = expert?.availability?.find(a => a.date === fields.date);
  const availableSlots = selectedAvail?.slots?.filter(s => !s.isBooked) || [];
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page-wrapper" style={{ paddingTop: 32, maxWidth: 680 }}>
      <Link to={`/experts/${id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        ← Back to Expert
      </Link>

      <div style={{ marginBottom: 28 }}>
        <p className="section-label">Session Booking</p>
        <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Book with {expert?.name}</h1>
        {expert && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {expert.category} · ${expert.hourlyRate}/hr
          </p>
        )}
      </div>

      <div className="card" style={{ padding: 32 }}>
        {apiError && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid var(--error)',
            borderRadius: 'var(--radius-sm)', padding: '12px 16px',
            color: 'var(--error)', fontSize: '0.875rem', marginBottom: 24,
          }}>
            ⚠ {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                Full Name <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                name="clientName"
                value={fields.clientName}
                onChange={handleChange}
                placeholder="Your full name"
                style={{ borderColor: validationErrors.clientName ? 'var(--error)' : undefined }}
              />
              {validationErrors.clientName && <p className="field-error">{validationErrors.clientName}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                Email Address <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                name="clientEmail"
                type="email"
                value={fields.clientEmail}
                onChange={handleChange}
                placeholder="you@example.com"
                style={{ borderColor: validationErrors.clientEmail ? 'var(--error)' : undefined }}
              />
              {validationErrors.clientEmail && <p className="field-error">{validationErrors.clientEmail}</p>}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
              Phone Number <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <input
              name="clientPhone"
              value={fields.clientPhone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              style={{ borderColor: validationErrors.clientPhone ? 'var(--error)' : undefined }}
            />
            {validationErrors.clientPhone && <p className="field-error">{validationErrors.clientPhone}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                Date <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <select
                name="date"
                value={fields.date}
                onChange={handleChange}
                style={{ borderColor: validationErrors.date ? 'var(--error)' : undefined }}
              >
                <option value="">Select a date</option>
                {expert?.availability?.map(avail => {
                  const freeCount = avail.slots.filter(s => !s.isBooked).length;
                  return (
                    <option key={avail.date} value={avail.date} disabled={freeCount === 0}>
                      {formatDate(avail.date)} {freeCount === 0 ? '(Full)' : `(${freeCount} slots)`}
                    </option>
                  );
                })}
              </select>
              {validationErrors.date && <p className="field-error">{validationErrors.date}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                Time Slot <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <select
                name="timeSlot"
                value={fields.timeSlot}
                onChange={handleChange}
                disabled={!fields.date}
                style={{ borderColor: validationErrors.timeSlot ? 'var(--error)' : undefined }}
              >
                <option value="">Select a time</option>
                {availableSlots.map(slot => (
                  <option key={slot.time} value={slot.time}>
                    {formatTime(slot.time)}
                  </option>
                ))}
              </select>
              {validationErrors.timeSlot && <p className="field-error">{validationErrors.timeSlot}</p>}
              {fields.date && availableSlots.length === 0 && (
                <p style={{ color: 'var(--error)', fontSize: '0.78rem', marginTop: 4 }}>No slots available for this date</p>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
              Notes / Agenda <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
            </label>
            <textarea
              name="notes"
              value={fields.notes}
              onChange={handleChange}
              placeholder="What would you like to discuss in this session?"
              rows={4}
              style={{ resize: 'vertical', borderColor: validationErrors.notes ? 'var(--error)' : undefined }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {validationErrors.notes
                ? <p className="field-error">{validationErrors.notes}</p>
                : <span />
              }
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {fields.notes.length}/500
              </span>
            </div>
          </div>

          {/* Summary */}
          {fields.date && fields.timeSlot && (
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 18px',
              marginBottom: 24,
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Booking Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span>👤 {expert?.name}</span>
                <span>📅 {formatDate(fields.date)}</span>
                <span>🕐 {formatTime(fields.timeSlot)}</span>
                <span>💰 ${expert?.hourlyRate} (1 hour)</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: '100%', padding: '13px', fontSize: '0.95rem' }}
          >
            {submitting ? (
              <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Confirming...</>
            ) : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
