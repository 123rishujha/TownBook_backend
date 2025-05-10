const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  memberUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  dateId: {
    type: mongoose.Schema.Types.ObjectId,
    // ref: 'Date',
    required: true
  },
  date: String,
  SlotStartTime: String,
  SlotEndTime: String,
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    // ref: 'Slot',
    required: true
  },
  librarianUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reservation', ReservationSchema);
