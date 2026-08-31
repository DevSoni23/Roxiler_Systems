const pool = require('../config/db');

// Create a new store (admin only)
const createStore = async ({ name, email, address, owner_id }) => {
    const result = await pool.query(
        `INSERT INTO stores (name, email, address, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, address, owner_id, created_at`,
        [name, email, address, owner_id]
    );
    return result.rows[0];
};

// Get all stores, with their AVERAGE rating computed via JOIN
// Get all stores, with average rating AND the current user's own rating, with optional search
const getAllStores = async ({ userId, name, address }) => {
  let query = `
    SELECT 
      s.id, s.name, s.email, s.address,
      COALESCE(AVG(r.rating), 0)::numeric(2,1) AS average_rating,
      COUNT(r.id) AS total_ratings,
      (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = $1) AS my_rating
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    WHERE 1=1
  `;
  const params = [userId];

  if (name) {
    params.push(`%${name}%`);
    query += ` AND s.name ILIKE $${params.length}`;
  }
  if (address) {
    params.push(`%${address}%`);
    query += ` AND s.address ILIKE $${params.length}`;
  }

  query += ` GROUP BY s.id ORDER BY s.name ASC`;

  const result = await pool.query(query, params);
  return result.rows;
};

// Get the store owned by a specific user
const getStoreByOwnerId = async (ownerId) => {
  const result = await pool.query(
    `SELECT id, name, email, address FROM stores WHERE owner_id = $1`,
    [ownerId]
  );
  return result.rows[0];
};

// Get all users who rated a specific store, plus the store's average rating
const getStoreRatingsDetail = async (storeId) => {
  const ratings = await pool.query(
    `SELECT u.id, u.name, u.email, r.rating, r.updated_at
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.store_id = $1
     ORDER BY r.updated_at DESC`,
    [storeId]
  );

  const avg = await pool.query(
    `SELECT COALESCE(AVG(rating), 0)::numeric(2,1) AS average_rating FROM ratings WHERE store_id = $1`,
    [storeId]
  );

  return {
    ratings: ratings.rows,
    average_rating: avg.rows[0].average_rating,
  };
};

module.exports = { createStore, getAllStores, getStoreByOwnerId, getStoreRatingsDetail };
