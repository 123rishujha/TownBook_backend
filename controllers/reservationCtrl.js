const ReservationModel = require('../models/ReservationModel');

// Create a new reservation
const createReservation = async (req, res, next) => {
  try {
    const { dateId, SlotStartTime, SlotEndTime, ...rest } = req.body;
    const reservation = new ReservationModel({
      ...rest,
      dateId,
      SlotStartTime,
      SlotEndTime
    });
    await reservation.save();
    res.status(201).json({ success: true, data: reservation,msg: "Reservation created successfully" });
  } catch (error) {
    next(error);
  }
};

// Get all reservations
const getAllReservations = async (req, res, next) => {
  try {
    const reservations = await ReservationModel.find().populate('memberUserId dateId slotId librarianUserId');
    res.status(200).json({ success: true, data: reservations });
  } catch (error) {
    next(error);
  }
};

// Get a reservation by ID
const getReservationById = async (req, res, next) => {
  try {
    const reservation = await ReservationModel.findById(req.params.id)
      .populate('memberUserId')
      .populate('librarianUserId');
    if (!reservation) return res.status(404).json({ success: false, msg: 'Reservation not found' });
    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

// Update a reservation
const updateReservation = async (req, res, next) => {
  try {
    const reservation = await ReservationModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('memberUserId dateId slotId librarianUserId');
    if (!reservation) return res.status(404).json({ success: false, msg: 'Reservation not found' });
    res.status(200).json({ success: true, data: reservation, msg: "Reservation updated successfully" });
  } catch (error) {
    next(error);
  }
};

// Delete a reservation
const deleteReservation = async (req, res, next) => {
  try {
    const reservation = await ReservationModel.findByIdAndDelete(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, msg: 'Reservation not found' });
    res.status(200).json({ success: true, msg: 'Reservation deleted' });
  } catch (error) {
    next(error);
  }
};

// Get all reservations for a member user
const getMemberReservations = async (req, res, next) => {
  try {
    const reservations = await ReservationModel.find({ memberUserId: req.params.userId })
      .populate('memberUserId')
      .populate('librarianUserId');
    res.status(200).json({ success: true, data: reservations });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
  getMemberReservations
};
