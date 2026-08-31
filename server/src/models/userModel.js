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

// Find a user by email (used during login, and to check duplicates during signup)
const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
};

// Admin: create a user with any role (admin creating admin/normal/store_owner)
const createUserByAdmin = async ({ name, email, password, address, role }) => {
  const allowedSortFields = ['name', 'email', 'role', 'created_at'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
  const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  query += ` ORDER BY ${sortField} ${sortOrder}`;

  const result = await pool.query(query, params);
  return result.rows;
};

// Get all users, with optional filters (name/email/address/role)
const getAllUsers = async ({ name, email, address, role }) => {
  let query = `SELECT id, name, email, address, role, created_at FROM users WHERE 1=1`;
  const params = [];

  if (name) {
    params.push(`%${name}%`);
    query += ` AND name ILIKE $${params.length}`;
  }
  if (email) {
    params.push(`%${email}%`);
    query += ` AND email ILIKE $${params.length}`;
  }
  if (address) {
    params.push(`%${address}%`);
    query += ` AND address ILIKE $${params.length}`;
  }
  if (role) {
    params.push(role);
    query += ` AND role = $${params.length}`;
  }

  query += ` ORDER BY name ASC`;

  const result = await pool.query(query, params);
  return result.rows;
};

// Dashboard: get counts for admin overview
const getDashboardStats = async () => {
  const usersCount = await pool.query(`SELECT COUNT(*) FROM users`);
  const storesCount = await pool.query(`SELECT COUNT(*) FROM stores`);
  const ratingsCount = await pool.query(`SELECT COUNT(*) FROM ratings`);

  return {
    totalUsers: parseInt(usersCount.rows[0].count),
    totalStores: parseInt(storesCount.rows[0].count),
    totalRatings: parseInt(ratingsCount.rows[0].count),
  };
};

const updatePassword = async (userId, hashedPassword) => {
  await pool.query(
    `UPDATE users SET password = $1 WHERE id = $2`,
    [hashedPassword, userId]
  );
};

module.exports = { createUser, findUserByEmail, createUserByAdmin, getAllUsers, getDashboardStats, updatePassword };