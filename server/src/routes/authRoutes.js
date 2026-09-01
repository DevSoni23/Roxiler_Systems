const express = require('express');
const router = express.Router();
const { signup, login, changePassword, updateProfile } = require('../controllers/authController');
const { validate, signupSchema, loginSchema, passwordUpdateSchema, profileUpdateSchema } = require('../middleware/validators');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/signup', validate(signupSchema), signup);
router.post('/login',  validate(loginSchema),  login);

// Protected routes — require valid JWT
router.put('/change-password', authenticate, validate(passwordUpdateSchema), changePassword);
router.put('/profile',         authenticate, validate(profileUpdateSchema),  updateProfile);

module.exports = router;