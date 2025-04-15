const express = require('express');
const {
  createMenuItem,
  getAllMenuItems,
  getMenuItemsByCategory,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/admin');

const router = express.Router();

// Public routes
router.get('/', getAllMenuItems);
router.get('/category/:category', getMenuItemsByCategory);

// Admin routes
router.post('/', verifyToken, isAdmin, createMenuItem);
router.put('/:id', verifyToken, isAdmin, updateMenuItem);
router.delete('/:id', verifyToken, isAdmin, deleteMenuItem);

module.exports = router;