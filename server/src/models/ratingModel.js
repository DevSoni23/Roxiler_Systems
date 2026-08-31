const pool = require('../config/db');

// Submit or update a rating — this is an "upsert"
const upsertRating = async ({ user_id, store_id, rating }) => {
  const result = await pool.query(
    `INSERT INTO ratings (user_id, store_id, rating)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, store_id)
     DO UPDATE SET rating = $3, updated_at = NOW()
     RETURNING id, user_id, store_id, rating, updated_at`,
    [user_id, store_id, rating]
  );
  return result.rows[0];
};

module.exports = { upsertRating };