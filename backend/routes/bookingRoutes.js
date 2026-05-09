const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { createBooking, getBookingsByEmail, updateBookingStatus } = require('../controllers/bookingController');
const validate = require('../middleware/validate');

// POST /bookings
router.post(
  '/',
  [
    body('expertId').isMongoId().withMessage('Invalid expert ID'),
    body('clientName')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('clientEmail')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email address'),
    body('clientPhone')
      .trim()
      .notEmpty().withMessage('Phone number is required')
      .matches(/^[+\d\s\-()]{7,20}$/).withMessage('Please provide a valid phone number'),
    body('date')
      .notEmpty().withMessage('Date is required')
      .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format')
      .custom((value) => {
        const today = new Date().toISOString().split('T')[0];
        if (value < today) {
          throw new Error('Cannot book a slot in the past');
        }
        return true;
      }),
    body('timeSlot')
      .notEmpty().withMessage('Time slot is required')
      .matches(/^\d{2}:\d{2}$/).withMessage('Time slot must be in HH:MM format'),
    body('notes')
      .optional()
      .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  ],
  validate,
  createBooking
);

// GET /bookings?email=
router.get(
  '/',
  [
    query('email')
      .notEmpty().withMessage('Email query parameter is required')
      .isEmail().withMessage('Please provide a valid email address'),
  ],
  validate,
  getBookingsByEmail
);

// PATCH /bookings/:id/status
router.patch(
  '/:id/status',
  [
    param('id').isMongoId().withMessage('Invalid booking ID'),
    body('status')
      .notEmpty().withMessage('Status is required')
      .isIn(['Pending', 'Confirmed', 'Completed', 'Cancelled']).withMessage('Invalid status value'),
  ],
  validate,
  updateBookingStatus
);

module.exports = router;
