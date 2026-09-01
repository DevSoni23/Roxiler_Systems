const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail, updatePassword, updateUserProfile } = require('../models/userModel');

const signup = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();

    // Check if user already exists
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);
    // Normal signup always creates a 'user' role user
    const newUser = await createUser({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      address,
      role: 'user',
    });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();

    // Find the user
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare submitted password against the hashed one in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create JWT — encodes user id and role, signed with your secret
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Fetch current user to verify old password
    const result = await require('../config/db').query('SELECT password FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await updatePassword(userId, hashedNew);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /auth/profile — any logged-in user updates their name & address
const updateProfile = async (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name || name.trim().length < 20) {
      return res.status(400).json({ message: 'Name must be at least 20 characters' });
    }
    if (address && address.length > 400) {
      return res.status(400).json({ message: 'Address must be at most 400 characters' });
    }
    const updated = await updateUserProfile(req.user.id, { name: name.trim(), address: address || '' });
    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { signup, login, changePassword, updateProfile };


