const { createStore, getAllStores, getStoreByOwnerId, getStoreRatingsDetail, updateStoreByOwner } = require('../models/storeModel');
const { updateUserProfile } = require('../models/userModel');

const addStore = async (req, res) => {
    try {
        const { name, email, address, owner_id } = req.body;
        const store = await createStore({ name, email, address, owner_id });
        res.status(201).json({ message: 'Store created successfully', store });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const listStores = async (req, res) => {
  try {
    const { name, address } = req.query;
    const stores = await getAllStores({ userId: req.user.id, name, address });
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const ownerDashboard = async (req, res) => {
  try {
    const store = await getStoreByOwnerId(req.user.id);
    if (!store) {
      return res.status(404).json({ message: 'No store found for this owner' });
    }

    const detail = await getStoreRatingsDetail(store.id);
    res.json({ store, ...detail });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /stores/owner/profile — owner updates their store details
const updateOwnerStore = async (req, res) => {
  try {
    const { name, email, address } = req.body;
    if (!name || !email || !address) {
      return res.status(400).json({ message: 'name, email and address are required' });
    }
    const updated = await updateStoreByOwner(req.user.id, { name, email, address });
    if (!updated) {
      return res.status(404).json({ message: 'No store found for this owner' });
    }
    res.json({ message: 'Store updated successfully', store: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /stores/owner/me — owner updates their personal profile (name, address)
const updateOwnerProfile = async (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }
    const updated = await updateUserProfile(req.user.id, { name, address });
    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { addStore, listStores, ownerDashboard, updateOwnerStore, updateOwnerProfile };
