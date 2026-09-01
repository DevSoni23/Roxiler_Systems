# 🏬 Roxiler Systems — Store Rating Platform

A full-stack web application built for managing stores, submitting user ratings (1 to 5 stars), and providing role-based administration for System Administrators, Normal Users, and Store Owners.

---

## 🚀 Tech Stack

- **Frontend**: React.js (Vite), Modern Vanilla CSS (Glassmorphism Dark Theme, Micro-animations, Responsive Design)
- **Backend**: Express.js (Node.js) with MVC Architecture
- **Database**: PostgreSQL (Relational schema with foreign keys & cascade constraints)
- **Security**: JWT Authentication, Bcrypt Password Hashing, Joi Input Validation, CORS Protection

---

## 👥 User Roles & Features

### 1. 👑 System Administrator
- **Dashboard Metrics**: Total Users, Total Stores, and Total Submitted Ratings.
- **User Management**: Add new users with assigned roles (`admin`, `store_owner`, `user`), view details, and delete users.
- **Store Management**: Add new stores, assign store owners, view listings with average rating, and delete stores.
- **Filtering & Sorting**: Multi-field search filters (Name, Email, Address, Role) and bidirectional column sorting.

### 2. 👤 Normal User
- **Account Registration & Auth**: Self-signup and secure login.
- **Store Directory**: Browse all registered stores with Name, Address, Overall Rating, and personal submitted rating.
- **Interactive Ratings**: Submit or modify 1 to 5-star ratings for individual stores.
- **Profile Management**: Update personal Name & Address, change password securely.

### 3. 🏪 Store Owner
- **Dashboard Overview**: Monitor store's average star rating and review count.
- **Customer Feedback Table**: View users who submitted ratings for their store (Name, Email, Rating, Date) with column sorting.
- **Store & Profile Customization**: Update store information (Name, Email, Address), update personal profile, and change account password.

---

## 📋 Form Validations & Security Rules

- **Name**: 20 to 60 characters enforced.
- **Address**: Maximum 400 characters allowed.
- **Password**: 8 to 16 characters, requiring at least 1 uppercase letter and 1 special character (`/^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,16}$/`).
- **Email**: RFC standard email format validation.
- **SQL Injection Prevention**: Parameterized queries across all database access methods.

---

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL Database running locally or on cloud (Neon/Supabase)

### 2. Backend Setup
```bash
cd server
npm install
npm start
```
*Make sure your `.env` file contains your database connection configuration:*
```env
PORT=5000
JWT_SECRET=your_jwt_secret_key
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=roxiler_db
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Credentials

- **Admin**: `admin@roxiler.com` | Password: `Admin@123`
- **Store Owner**: `vikram.patel@demo.com` | Password: `Devsoni@123`
- **Normal User**: `priya.sharma@demo.com` | Password: `Devsoni@123`
