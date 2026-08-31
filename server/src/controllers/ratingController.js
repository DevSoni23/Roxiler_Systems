const { upsertRating } = require('../models/ratingModel');

const submitRating = async (req, res) => {
  try {
    const { store_id, rating } = req.body;
    const user_id = req.user.id; // comes from the JWT via authenticate middleware

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const result = await upsertRating({ user_id, store_id, rating });
    res.status(200).json({ message: 'Rating submitted', rating: result });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { submitRating };
