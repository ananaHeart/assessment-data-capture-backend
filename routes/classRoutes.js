const express = require('express');
const router = express.Router();
const { createClass, getAllClasses, getMyClasses } = require('../controllers/classController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// --- Principal/Admin Routes ---
// protect -> make sure user is logged in
// restrictTo('principal', 'admin') -> make sure user is a principal or admin
router.post('/', protect, restrictTo('principal', 'admin'), createClass);
router.get('/', protect, restrictTo('principal', 'admin'), getAllClasses);

// --- Teacher Route ---
// A new function getMyClasses will be added to classController
router.get('/my-classes', protect, restrictTo('teacher'), getMyClasses);

module.exports = router;