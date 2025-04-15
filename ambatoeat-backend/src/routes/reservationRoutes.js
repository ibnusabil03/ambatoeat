const express = require('express');
const {
  createReservation,
  getAllReservations,
  getUserReservations,
  softDeleteReservation,
  hardDeleteReservation
} = require('../controllers/reservationController');
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/admin');
const isUser = require('../middleware/user');

const router = express.Router();

// User routes
router.post('/', verifyToken, isUser, createReservation);
router.get('/user', verifyToken, isUser, getUserReservations);
router.delete('/user/:id', verifyToken, isUser, softDeleteReservation);

// Admin routes
router.get('/', verifyToken, isAdmin, getAllReservations);
router.delete('/admin/:id', verifyToken, isAdmin, hardDeleteReservation);

module.exports = router;