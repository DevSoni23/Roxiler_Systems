const express = require('express');
const router = express.Router();
const {
  addUser, listUsers, dashboard, listStoreOwners,
  createStoreByAdmin, listAllStores, removeUser, removeStore,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validate, adminAddUserSchema, adminAddStoreSchema } = require('../middleware/validators');

// Every route here requires admin role
router.post('/users',        authenticate, authorize('admin'), validate(adminAddUserSchema), addUser);
router.get('/users',         authenticate, authorize('admin'), listUsers);
router.delete('/users/:id',  authenticate, authorize('admin'), removeUser);

router.get('/dashboard',     authenticate, authorize('admin'), dashboard);

router.get('/store-owners',  authenticate, authorize('admin'), listStoreOwners);
router.get('/stores',        authenticate, authorize('admin'), listAllStores);
router.post('/stores',       authenticate, authorize('admin'), validate(adminAddStoreSchema), createStoreByAdmin);
router.delete('/stores/:id', authenticate, authorize('admin'), removeStore);

module.exports = router;