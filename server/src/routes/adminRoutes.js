const express = require('express');
const router = express.Router();
const { addUser, listUsers, dashboard, listStoreOwners, createStoreByAdmin } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Every route here requires admin role — applied to all
router.post('/users', authenticate, authorize('admin'), addUser);
router.get('/users', authenticate, authorize('admin'), listUsers);
router.get('/dashboard', authenticate, authorize('admin'), dashboard);
router.get('/store-owners', authenticate, authorize('admin'), listStoreOwners);
router.post('/stores', authenticate, authorize('admin'), createStoreByAdmin);

module.exports = router;