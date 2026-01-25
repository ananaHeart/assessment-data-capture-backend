const express = require('express');
const router = express.Router();
const { 
  getTestsByClass, 
  createTest,
  createTestPart,
  createQuestion,
  getTestDetails,
} = require('../controllers/testController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All test routes should be protected and restricted to teachers
router.use(protect, restrictTo('teacher'));

// Routes for managing the main test object
router.get('/class/:classId', getTestsByClass);
router.post('/', createTest);
router.get('/:testId/details', getTestDetails); // Get a full test with parts and questions

// Routes for managing test parts
router.post('/:testId/parts', createTestPart);

// Routes for managing questions
router.post('/parts/:partId/questions', createQuestion);

module.exports = router;