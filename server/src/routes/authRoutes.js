const express = require('express');
const router = express.Router();
const { signup, login, changePassword } = require('../controllers/authController');
const { validate, signupSchema, loginSchema, passwordUpdateSchema } = require('../middleware/validators');

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/update-password', validate(passwordUpdateSchema), changePassword);

module.exports = router;