// routes/userRoutes.js
// This is the final, correct version with no duplicates.

const express = require('express');
const router = express.Router();

// We import everything we need from the correct files
const { 
  registerUser, 
  loginUser, 
  getAllUsers, 
  deleteUser, 
  updateUserStatus, 
  updateUser 
} = require('../controllers/userController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

// --- PUBLIC ROUTES ---
router.post('/register', registerUser);
router.post('/login', loginUser);

// --- PROTECTED ROUTES (for Admin and Principal) ---

// This is the main route to get users. It can be filtered by role (e.g., /api/users?role=teacher)
router.get('/', protect, restrictTo('principal', 'admin'), getAllUsers);

// This is the route to update a user's status (for approval, etc.)
router.put('/:id/status', protect, restrictTo('principal', 'admin'), updateUserStatus);

// This is the route to update a user's general profile info
router.put('/:id', protect, restrictTo('principal', 'admin'), updateUser);

// This is the route to delete a user
router.delete('/:id', protect, restrictTo('principal', 'admin'), deleteUser);

module.exports = router;