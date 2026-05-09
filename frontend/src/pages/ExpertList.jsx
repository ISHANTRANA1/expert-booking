import React, { useState, useEffect, useCallback } from 'react';
import { fetchExperts } from '../utils/api';
import ExpertCard from '../components/ExpertCard';

const CATEGORIES = ['All', 'Technology', 'Business', 'Finance', 'Healthcare', 'Legal', 'Marketing', 'Design', 'Education', 'Psychology', 'Career'];

export default function ExpertList() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const loadExperts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchExperts({ page, limit: 8, search, category });
      setExperts(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load experts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => { loadExperts(); }, [loadExperts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  return (
    <div className="page-wrapper" style={{ paddingTop: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <p className="section-label">Discover</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: 12 }}>
          Find Your Expert
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 500 }}>
          Connect with world-class professionals for one-on-one sessions tailored to your needs.
        </p>
      </div>

      {/* Search + Filter */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ position: 'relative', maxWidth: 480, marginBottom: 20 }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', fontSize: '1rem',
          }}>🔍</span>
          <input
            type="text"
            placeholder="Search by name or expertise..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className="btn"
              style={{
                padding: '6px 14px',
                fontSize: '0.78rem',
                borderRadius: 99,
                background: category === cat ? 'var(--accent)' : 'var(--bg-card)',
                color: category === cat ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${category === cat ? 'var(--accent)' : 'var(--border)'}`,
                boxShadow: category === cat ? '0 0 16px var(--accent-glow)' : 'none',
              }}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading && pagination && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 20 }}>
          {pagination.totalExperts} expert{pagination.totalExperts !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <div className="spinner" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid var(--error)',
          borderRadius: 'var(--radius)',
          padding: 24,
          textAlign: 'center',
          color: 'var(--error)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>⚠</div>
          <p>{error}</p>
          <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={loadExperts}>
            Try Again
          </button>
        </div>
      )}

      {/* Expert Grid */}
      {!loading && !error && experts.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
          marginBottom: 40,
        }}>
          {experts.map((expert, i) => (
            <ExpertCard key={expert._id} expert={expert} index={i} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && experts.length === 0 && (
        <div className="empty-state">
          <div className="icon">🔍</div>
          <h3 style={{ marginBottom: 8 }}>No experts found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <button
            className="btn btn-ghost"
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage(p => p - 1)}
          >← Prev</button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                width: 36, height: 36,
                borderRadius: 8,
                border: 'none',
                background: p === page ? 'var(--accent)' : 'var(--bg-card)',
                color: p === page ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'Sora, sans-serif',
                fontSize: '0.875rem',
                fontWeight: p === page ? 600 : 400,
              }}
            >{p}</button>
          ))}

          <button
            className="btn btn-ghost"
            disabled={!pagination.hasNextPage}
            onClick={() => setPage(p => p + 1)}
          >Next →</button>
        </div>
      )}
    </div>
  );
}
