const express = require('express');
const router = express.Router();
const { addUser, listUsers, dashboard } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Every route here requires admin role — applied to all three
router.post('/users', authenticate, authorize('admin'), addUser);
router.get('/users', authenticate, authorize('admin'), listUsers);
router.get('/dashboard', authenticate, authorize('admin'), dashboard);

module.exports = router;