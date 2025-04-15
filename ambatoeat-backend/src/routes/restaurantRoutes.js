const express = require('express');
const {
  getRestaurantInfo,
  updateRestaurantInfo,
  addFacility,
  deleteFacility
} = require('../controllers/restaurantController');
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/admin');

const router = express.Router();

// Public routes
router.get('/', getRestaurantInfo);

// Admin routes
router.put('/', verifyToken, isAdmin, updateRestaurantInfo);
router.post('/facility', verifyToken, isAdmin, addFacility);
router.delete('/facility/:id', verifyToken, isAdmin, deleteFacility);

module.exports = router;