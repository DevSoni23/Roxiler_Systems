const pool = require('../config/db');

// Create a new user
const createUser = async ({ name, email, password, address, role }) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, address, role, created_at`,
    [name, email, password, address, role]
  );

  return result.rows[0];
};

// Find a user by email
const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

  return result.rows[0];
};

// Admin: create a user with any role
const createUserByAdmin = async ({
  name,
  email,
  password,
  address,
  role
}) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, address, role, created_at`,
    [name, email, password, address, role]
  );

  return result.rows[0];
};

// Get all users with optional filters and sorting
const getAllUsers = async ({
  name,
  email,
  address,
  role,
  sortBy,
  order
}) => {
  let query = `
    SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
           COALESCE(AVG(r.rating), 0)::numeric(2,1) AS store_rating,
           s.name AS store_name
    FROM users u
    LEFT JOIN stores s ON s.owner_id = u.id
    LEFT JOIN ratings r ON r.store_id = s.id
    WHERE 1=1
  `;

  const params = [];

  if (name) {
    params.push(`%${name}%`);
    query += ` AND u.name ILIKE $${params.length}`;
  }

  if (email) {
    params.push(`%${email}%`);
    query += ` AND u.email ILIKE $${params.length}`;
  }

  if (address) {
    params.push(`%${address}%`);
    query += ` AND u.address ILIKE $${params.length}`;
  }

  if (role) {
    params.push(role);
    query += ` AND u.role = $${params.length}`;
  }

  query += ` GROUP BY u.id, s.id`;

  const allowedSortFields = {
    name: 'u.name',
    email: 'u.email',
    address: 'u.address',
    role: 'u.role',
    rating: 'store_rating',
    created_at: 'u.created_at',
  };

  const sortField = allowedSortFields[sortBy] || 'u.name';

  const sortOrder =
    String(order).toLowerCase() === 'desc'
      ? 'DESC'
      : 'ASC';

  query += ` ORDER BY ${sortField} ${sortOrder}`;

  const result = await pool.query(query, params);

  return result.rows;
};


// Dashboard statistics
const getDashboardStats = async () => {
  const usersCount = await pool.query(
    `SELECT COUNT(*) FROM users`
  );

  const storesCount = await pool.query(
    `SELECT COUNT(*) FROM stores`
  );

  const ratingsCount = await pool.query(
    `SELECT COUNT(*) FROM ratings`
  );

  return {
    totalUsers: parseInt(usersCount.rows[0].count),
    totalStores: parseInt(storesCount.rows[0].count),
    totalRatings: parseInt(ratingsCount.rows[0].count),
  };
};

// Get all users with role store_owner (for store creation dropdown)
const getStoreOwners = async () => {
  const result = await pool.query(
    `SELECT id, name, email FROM users WHERE role = 'store_owner' ORDER BY name ASC`
  );
  return result.rows;
};

// Update password
const updatePassword = async (userId, hashedPassword) => {
  await pool.query(
    `UPDATE users SET password = $1 WHERE id = $2`,
    [hashedPassword, userId]
  );
};

// Update user profile (name, address)
const updateUserProfile = async (userId, { name, address }) => {
  const result = await pool.query(
    `UPDATE users SET name = $1, address = $2 WHERE id = $3
     RETURNING id, name, email, address, role`,
    [name, address, userId]
  );
  return result.rows[0];
};

// Delete a user and their ratings
const deleteUserById = async (userId) => {
  await pool.query(`DELETE FROM ratings WHERE user_id = $1`, [userId]);
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING id`,
    [userId]
  );
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  createUserByAdmin,
  getAllUsers,
  getDashboardStats,
  updatePassword,
  getStoreOwners,
  updateUserProfile,
  deleteUserById,
};