const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  expertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expert',
    required: [true, 'Expert ID is required'],
  },
  expertName: {
    type: String,
    required: true,
  },
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
  },
  clientEmail: {
    type: String,
    required: [true, 'Client email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  clientPhone: {
    type: String,
    required: [true, 'Client phone is required'],
    trim: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: [true, 'Date is required'],
  },
  timeSlot: {
    type: String, // Format: HH:MM
    required: [true, 'Time slot is required'],
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

// Compound unique index to prevent double booking
bookingSchema.index(
  { expertId: 1, date: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: { $nin: ['Cancelled'] } } }
);

// Index for email lookups
bookingSchema.index({ clientEmail: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
