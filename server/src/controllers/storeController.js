const { createStore, getAllStores, getStoreByOwnerId, getStoreRatingsDetail } = require('../models/storeModel');

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

module.exports = { addStore, listStores, ownerDashboard };


