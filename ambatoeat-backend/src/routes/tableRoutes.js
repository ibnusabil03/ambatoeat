const express = require('express');
const {
  createTable,
  getAllTables,
  getAvailableTables,
  updateTable,
  deleteTable
} = require('../controllers/tableController');
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/admin');
const isUser = require('../middleware/user');

const router = express.Router();

// User routes
router.get('/available', verifyToken, isUser, getAvailableTables);

// Admin routes
router.get('/', verifyToken, isAdmin, getAllTables);
router.post('/', verifyToken, isAdmin, createTable);
router.put('/:id', verifyToken, isAdmin, updateTable);
router.delete('/:id', verifyToken, isAdmin, deleteTable);

module.exports = router;