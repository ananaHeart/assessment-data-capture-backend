const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  createAcademicYear,
  getAllAcademicYears,
  getAcademicYearById,
  updateAcademicYear,
  deleteAcademicYear,
  createGradeLevel,
  getAllGradeLevels,
  getGradeLevelById,
  updateGradeLevel,
  deleteGradeLevel,
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  createSection,       // <-- ADD/CONFIRM THIS IS HERE
  getAllSections,
  getSectionById,
  updateSection,
  deleteSection,
  createCurriculumEntry,
  getAllCurriculum,
  getCurriculumByGrade,
  deleteCurriculumEntry,
  updateCurriculumEntry,
  getActiveAcademicYear,
  getDashboardSummary


} = require('../controllers/schoolController');

// --- Academic Year Routes ---
router.post('/academic-years', protect, restrictTo('principal', 'admin'), createAcademicYear);
router.get('/academic-years', protect, restrictTo('principal', 'admin'), getAllAcademicYears);
router.get('/academic-years/:id', protect, restrictTo('principal', 'admin'), getAcademicYearById);
router.put('/academic-years/:id', protect, restrictTo('principal', 'admin'), updateAcademicYear);
router.delete('/academic-years/:id', protect, restrictTo('principal', 'admin'), deleteAcademicYear);
router.get('/academic-years/active', protect, getActiveAcademicYear);
router.get(
  '/dashboard-summary',
  protect,
  restrictTo('principal', 'admin'),
  getDashboardSummary
);

// --- Routes for Grade Levels ---
router.post('/grade-levels', protect, restrictTo('principal', 'admin'), createGradeLevel);
router.get('/grade-levels', protect, restrictTo('principal', 'admin'), getAllGradeLevels);
router.get('/grade-levels/:id', protect, restrictTo('principal', 'admin'), getGradeLevelById);    // <-- ADD
router.put('/grade-levels/:id', protect, restrictTo('principal', 'admin'), updateGradeLevel);    // <-- ADD
router.delete('/grade-levels/:id', protect, restrictTo('principal', 'admin'), deleteGradeLevel);  // <-- ADD

// Routes for Subjects
router.post('/subjects', protect, restrictTo('principal', 'admin'), createSubject);
router.get('/subjects', protect, restrictTo('principal', 'admin'), getAllSubjects);
router.get('/subjects/:id', protect, restrictTo('principal', 'admin'), getSubjectById);      // <-- ADD
router.put('/subjects/:id', protect, restrictTo('principal', 'admin'), updateSubject);      // <-- ADD
router.delete('/subjects/:id', protect, restrictTo('principal', 'admin'), deleteSubject);  // <-- ADD

// --- Routes for Sections ---
router.post('/sections', protect, restrictTo('principal', 'admin'), createSection);
router.get('/sections', protect, restrictTo('principal', 'admin'), getAllSections);
router.get('/sections/:id', protect, restrictTo('principal', 'admin'), getSectionById);      // <-- ADD
router.put('/sections/:id', protect, restrictTo('principal', 'admin'), updateSection);      // <-- ADD
router.delete('/sections/:id', protect, restrictTo('principal', 'admin'), deleteSection);

// --- Routes for Curriculum ---
router.post('/curriculum', protect, restrictTo('principal', 'admin'), createCurriculumEntry);
router.get('/curriculum', protect, restrictTo('principal', 'admin'), getAllCurriculum);          // <-- ADD (for Get All)
router.get('/curriculum/:gradeLevelId', protect, restrictTo('principal', 'admin'), getCurriculumByGrade);
router.put('/curriculum/:id', protect, restrictTo('principal', 'admin'), updateCurriculumEntry);    // <-- ADD
router.delete('/curriculum', protect, restrictTo('principal', 'admin'), deleteCurriculumEntry);
module.exports = router;