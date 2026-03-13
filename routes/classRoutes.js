const express = require("express");
const router = express.Router();

const {
  createClass,
  getAllClasses,
  getMyClasses,
  getStudentsByClass,
  getAssessmentsByClass
} = require("../controllers/classController");

const { protect, restrictTo } = require("../middleware/authMiddleware");

router.post("/", protect, restrictTo("admin"), createClass);

router.get("/", protect, getAllClasses);

router.get("/my-classes", protect, restrictTo("teacher"), getMyClasses);

router.get("/:classId/students", protect, restrictTo("teacher"), getStudentsByClass);

router.get("/:classId/assessments", protect, restrictTo("teacher"), getAssessmentsByClass);

module.exports = router;