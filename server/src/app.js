require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const app = express();

// Middleware — runs on every request before it reaches your routes
app.use(cors());           // allows frontend to call this backend
app.use(express.json());   // lets Express understand JSON request bodies
const { authenticate } = require('./middleware/authMiddleware');

app.get('/api/test-protected', authenticate, (req, res) => {
  res.json({ message: 'You are authenticated!', user: req.user });
});
// A simple test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is alive!' });
});

app.use('/api/auth', authRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});