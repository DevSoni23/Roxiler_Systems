const bcrypt = require('bcrypt');
const { createUserByAdmin, getAllUsers, getDashboardStats } = require('../models/userModel');

const addUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUserByAdmin({ name, email, password: hashedPassword, address, role });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const listUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy, order } = req.query;
    const users = await getAllUsers({ name, email, address, role, sortBy, order });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const dashboard = async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { addUser, listUsers, dashboard };