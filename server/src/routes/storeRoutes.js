const express = require('express');
const router = express.Router();
const { addStore, listStores, ownerDashboard, updateOwnerStore, updateOwnerProfile } = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Only admins can add stores
router.post('/', authenticate, authorize('admin'), addStore);

// Any logged-in user can view the store list
router.get('/', authenticate, listStores);

// Store owner dashboard
router.get('/owner/dashboard', authenticate, authorize('store_owner'), ownerDashboard);

// Store owner profile customization
router.put('/owner/profile', authenticate, authorize('store_owner'), updateOwnerStore);
router.put('/owner/me', authenticate, authorize('store_owner'), updateOwnerProfile);

module.exports = router;