import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Experts
export const fetchExperts = (params) =>
  api.get('/experts', { params }).then(r => r.data);

export const fetchExpertById = (id) =>
  api.get(`/experts/${id}`).then(r => r.data);

// Bookings
export const createBooking = (data) =>
  api.post('/bookings', data).then(r => r.data);

export const fetchBookingsByEmail = (email) =>
  api.get('/bookings', { params: { email } }).then(r => r.data);

export const updateBookingStatus = (id, status) =>
  api.patch(`/bookings/${id}/status`, { status }).then(r => r.data);

export default api;
