const pool = require('../config/db');

// Create store entry
const createStore = async ({ name, email, address, owner_id }) => {
  const result = await pool.query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, address, owner_id, created_at`,
    [name, email, address, owner_id]
  );
  return result.rows[0];
};

// Fetch stores with aggregated rating & current user's rating
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

// Fetch store owned by specific user ID
const getStoreByOwnerId = async (ownerId) => {
  const result = await pool.query(
    `SELECT id, name, email, address FROM stores WHERE owner_id = $1`,
    [ownerId]
  );
  return result.rows[0];
};

// Fetch all ratings for a store along with average score
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

// Update store info (restricted by owner_id)
const updateStoreByOwner = async (ownerId, { name, email, address }) => {
  const result = await pool.query(
    `UPDATE stores SET name = $1, email = $2, address = $3
     WHERE owner_id = $4
     RETURNING id, name, email, address, owner_id`,
    [name, email, address, ownerId]
  );
  return result.rows[0];
};

// Admin view: list all stores with sorting & filtering
const getAllStoresAdmin = async ({ name, address, sortBy, order } = {}) => {
  let query = `
    SELECT s.id, s.name, s.email, s.address,
           COALESCE(AVG(r.rating), 0)::numeric(2,1) AS average_rating,
           COUNT(r.id) AS total_ratings
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    WHERE 1=1
  `;
  const params = [];
  if (name)    { params.push(`%${name}%`);    query += ` AND s.name ILIKE $${params.length}`; }
  if (address) { params.push(`%${address}%`); query += ` AND s.address ILIKE $${params.length}`; }
  query += ` GROUP BY s.id`;

  const allowedSortFields = {
    name: 's.name',
    email: 's.email',
    address: 's.address',
    rating: 'average_rating',
  };

  const sortCol = allowedSortFields[sortBy] || 's.name';
  const sortDir = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  query += ` ORDER BY ${sortCol} ${sortDir}`;

  const result = await pool.query(query, params);
  return result.rows;
};

// Delete store + ratings cascade
const deleteStoreById = async (storeId) => {
  await pool.query(`DELETE FROM ratings WHERE store_id = $1`, [storeId]);
  const result = await pool.query(
    `DELETE FROM stores WHERE id = $1 RETURNING id`,
    [storeId]
  );
  return result.rows[0];
};

module.exports = { createStore, getAllStores, getStoreByOwnerId, getStoreRatingsDetail, updateStoreByOwner, getAllStoresAdmin, deleteStoreById };
