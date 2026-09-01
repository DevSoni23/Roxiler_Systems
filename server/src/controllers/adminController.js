const bcrypt = require('bcrypt');
const { createUserByAdmin, getAllUsers, getDashboardStats, getStoreOwners } = require('../models/userModel');
const { createStore } = require('../models/storeModel');

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

// GET /api/admin/store-owners — returns users with role store_owner for the Add Store dropdown
const listStoreOwners = async (req, res) => {
  try {
    const owners = await getStoreOwners();
    res.json(owners);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/admin/stores — admin creates a store and assigns it to an owner
const createStoreByAdmin = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;
    if (!name || !email || !address || !owner_id) {
      return res.status(400).json({ message: 'name, email, address and owner_id are required' });
    }
    const store = await createStore({ name, email, address, owner_id });
    res.status(201).json({ message: 'Store created successfully', store });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { addUser, listUsers, dashboard, listStoreOwners, createStoreByAdmin };