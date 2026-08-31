const express = require('express');
const router = express.Router();
const { addStore, listStores, ownerDashboard } = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Only admins can add stores
router.post('/', authenticate, authorize('admin'), addStore);

// Any logged-in user can view the store list
router.get('/', authenticate, listStores);
router.get('/owner/dashboard', authenticate, authorize('store_owner'), ownerDashboard);

module.exports = router;