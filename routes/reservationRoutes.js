const express = require('express');
const { 
  createReservation, 
  getAllReservations, 
  getReservationById, 
  updateReservation, 
  deleteReservation,
  getMemberReservations
} = require('../controllers/reservationCtrl');
const { authMiddleware } = require('../middlewares/authMiddleware');

const reservationRouter = express.Router();

// Authenticated User Routes
reservationRouter.post('/', authMiddleware, createReservation);
reservationRouter.get('/', authMiddleware, getAllReservations);
reservationRouter.get('/:id', authMiddleware, getReservationById);
reservationRouter.put('/:id', authMiddleware, updateReservation);
reservationRouter.delete('/:id', authMiddleware, deleteReservation);
reservationRouter.get('/member/:userId', authMiddleware, getMemberReservations);

module.exports = {reservationRouter};
