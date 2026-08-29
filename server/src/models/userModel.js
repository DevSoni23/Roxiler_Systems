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

module.exports = { createUser, findUserByEmail };