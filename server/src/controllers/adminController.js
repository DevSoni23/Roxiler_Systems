const bcrypt = require('bcrypt');
const { createUserByAdmin, getAllUsers, getDashboardStats, getStoreOwners, deleteUserById } = require('../models/userModel');
const { createStore, getAllStoresAdmin, deleteStoreById } = require('../models/storeModel');

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

// GET /api/admin/store-owners — dropdown for Add Store
const listStoreOwners = async (req, res) => {
  try {
    const owners = await getStoreOwners();
    res.json(owners);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/admin/stores — create store
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

// GET /api/admin/stores — list all stores with ratings
const listAllStores = async (req, res) => {
  try {
    const { name, address, sortBy, order } = req.query;
    const stores = await getAllStoresAdmin({ name, address, sortBy, order });
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// DELETE /api/admin/users/:id — delete a user and their ratings
const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    const deleted = await deleteUserById(id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/admin/stores/:id — delete a store and its ratings
const removeStore = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteStoreById(id);
    if (!deleted) return res.status(404).json({ message: 'Store not found' });
    res.json({ message: 'Store deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  addUser,
  listUsers,
  dashboard,
  listStoreOwners,
  createStoreByAdmin,
  listAllStores,
  removeUser,
  removeStore,
};