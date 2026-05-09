const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  slots: [{
    time: {
      type: String, // Format: HH:MM
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  }],
});

const expertSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Expert name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Technology', 'Business', 'Finance', 'Healthcare', 'Legal', 'Marketing', 'Design', 'Education', 'Psychology', 'Career'],
  },
  experience: {
    type: Number,
    required: [true, 'Experience years is required'],
    min: 0,
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
    default: 4.0,
  },
  bio: {
    type: String,
    trim: true,
  },
  specializations: [{
    type: String,
  }],
  avatar: {
    type: String,
    default: '',
  },
  hourlyRate: {
    type: Number,
    default: 100,
  },
  totalSessions: {
    type: Number,
    default: 0,
  },
  availability: [timeSlotSchema],
}, {
  timestamps: true,
});

// Index for search
expertSchema.index({ name: 'text', category: 1 });

module.exports = mongoose.model('Expert', expertSchema);
