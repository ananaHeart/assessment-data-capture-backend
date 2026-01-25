// routes/enrollmentRoutes.js

const express = require('express');
const router = express.Router();

// --- ALL IMPORTS, DECLARED ONLY ONCE ---
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { uploadEnrollment, getEnrolledStudentCount, getStudentsByClassId } = require('../controllers/enrollmentController');
const upload = require('../middleware/uploadMiddleware');

// ---------------------------------------

// --- ROUTES ---

router.post('/upload', protect, restrictTo('principal', 'admin'), upload.single('enrollmentFile'), uploadEnrollment);
router.get('/student-count', protect, restrictTo('principal', 'admin'), getEnrolledStudentCount);
router.get('/class/:classId/students', protect, restrictTo('teacher'), getStudentsByClassId);

module.exports = router;