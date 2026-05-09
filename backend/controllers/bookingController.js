const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Expert = require('../models/Expert');

// POST /bookings - Create a new booking
const createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { expertId, clientName, clientEmail, clientPhone, date, timeSlot, notes } = req.body;

    let createdBooking = null;

    await session.withTransaction(async () => {
      // Lock the expert document and check slot availability atomically
      const expert = await Expert.findOne({
        _id: expertId,
        'availability.date': date,
        'availability.slots': {
          $elemMatch: {
            time: timeSlot,
            isBooked: false,
          },
        },
      }).session(session);

      if (!expert) {
        const expertExists = await Expert.findById(expertId).session(session);
        if (!expertExists) {
          const err = new Error('Expert not found');
          err.status = 404;
          throw err;
        }
        const err = new Error('This time slot is no longer available. Please choose another slot.');
        err.status = 409;
        throw err;
      }

      // Mark slot as booked atomically
      const updateResult = await Expert.updateOne(
        {
          _id: expertId,
          'availability.date': date,
          'availability.slots': {
            $elemMatch: {
              time: timeSlot,
              isBooked: false,
            },
          },
        },
        {
          $set: {
            'availability.$[dateElem].slots.$[slotElem].isBooked': true,
          },
        },
        {
          arrayFilters: [
            { 'dateElem.date': date },
            { 'slotElem.time': timeSlot, 'slotElem.isBooked': false },
          ],
          session,
        }
      );

      if (updateResult.modifiedCount === 0) {
        const err = new Error('This time slot was just booked by someone else. Please choose another slot.');
        err.status = 409;
        throw err;
      }

      // Create the booking
      const [booking] = await Booking.create([{
        expertId,
        expertName: expert.name,
        clientName,
        clientEmail,
        clientPhone,
        date,
        timeSlot,
        notes: notes || '',
        status: 'Pending',
      }], { session });

      // Update booking reference in slot
      await Expert.updateOne(
        { _id: expertId, 'availability.date': date },
        {
          $set: {
            'availability.$[dateElem].slots.$[slotElem].bookingId': booking._id,
          },
        },
        {
          arrayFilters: [
            { 'dateElem.date': date },
            { 'slotElem.time': timeSlot },
          ],
          session,
        }
      );

      createdBooking = booking;
    });

    // Emit real-time update after successful transaction
    const io = req.app.get('io');
    if (io) {
      io.to(`expert-${expertId}`).emit('slot-booked', {
        expertId,
        date,
        timeSlot,
        bookingId: createdBooking._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully!',
      data: createdBooking,
    });
  } catch (error) {
    // Handle MongoDB duplicate key error (extra safety net)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please choose another slot.',
      });
    }
    next(error);
  } finally {
    session.endSession();
  }
};

// GET /bookings?email= - Get bookings by email
const getBookingsByEmail = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const bookings = await Booking.find({ clientEmail: email.toLowerCase() })
      .populate('expertId', 'name category avatar rating')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: bookings,
      total: bookings.length,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /bookings/:id/status - Update booking status
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    const prevStatus = booking.status;
    booking.status = status;
    await booking.save();

    // If cancelled, free up the slot
    if (status === 'Cancelled' && prevStatus !== 'Cancelled') {
      await Expert.updateOne(
        { _id: booking.expertId, 'availability.date': booking.date },
        {
          $set: {
            'availability.$[dateElem].slots.$[slotElem].isBooked': false,
            'availability.$[dateElem].slots.$[slotElem].bookingId': null,
          },
        },
        {
          arrayFilters: [
            { 'dateElem.date': booking.date },
            { 'slotElem.time': booking.timeSlot },
          ],
        }
      );

      // Emit slot freed up event
      const io = req.app.get('io');
      if (io) {
        io.to(`expert-${booking.expertId}`).emit('slot-freed', {
          expertId: booking.expertId,
          date: booking.date,
          timeSlot: booking.timeSlot,
        });
      }
    }

    // Emit status update
    const io = req.app.get('io');
    if (io) {
      io.emit(`booking-status-${id}`, { bookingId: id, status });
    }

    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getBookingsByEmail, updateBookingStatus };
