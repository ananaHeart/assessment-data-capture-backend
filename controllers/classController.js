const db = require("../config/db");

/*
==============================
CREATE CLASS
==============================
*/
const createClass = async (req, res) => {
  const { academicYearId, userId, subjectId, sectionId } = req.body;

  try {

    const sql = `
      INSERT INTO class 
      (academic_year_id, user_id, original_user_id, subject_id, section_id)
      VALUES (?, ?, ?, ?, ?)
    `;

    await db.query(sql, [
      academicYearId,
      userId,
      userId,
      subjectId,
      sectionId
    ]);

    res.status(201).json({ message: "Class created successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error creating class" });
  }
};


/*
==============================
GET ALL CLASSES (ADMIN)
==============================
*/
const getAllClasses = async (req, res) => {

  try {

    const sql = `
      SELECT
        c.class_id,
        s.subject_name,
        sec.section_name,
        gl.grade_level_name
      FROM class c
      JOIN subject s ON c.subject_id = s.subject_id
      JOIN section sec ON c.section_id = sec.section_id
      JOIN grade_level gl ON sec.grade_level_id = gl.grade_level_id
      ORDER BY gl.grade_level_name
    `;

    const [rows] = await db.query(sql);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching classes" });
  }
};


/*
==============================
GET MY CLASSES (TEACHER)
==============================
*/
const getMyClasses = async (req, res) => {

  const teacherId = req.user.user_id;

  try {

    const sql = `
      SELECT
        c.class_id,
        s.subject_name,
        sec.section_name,
        gl.grade_level_name
      FROM class c
      JOIN subject s ON c.subject_id = s.subject_id
      JOIN section sec ON c.section_id = sec.section_id
      JOIN grade_level gl ON sec.grade_level_id = gl.grade_level_id
      WHERE c.user_id = ?
      ORDER BY gl.grade_level_name
    `;

    const [rows] = await db.query(sql, [teacherId]);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching classes" });
  }
};


/*
==============================
GET STUDENTS BY CLASS
==============================
*/
const getStudentsByClass = async (req, res) => {

  try {

    const { classId } = req.params;

    const sql = `
      SELECT
        s.student_id,
        s.first_name,
        s.last_name
      FROM student_enrollment se
      JOIN student s ON se.student_id = s.student_id
      JOIN class c ON se.section_id = c.section_id
      WHERE c.class_id = ?
    `;

    const [rows] = await db.query(sql, [classId]);

    res.json(rows);

  } catch (error) {
    console.error("getStudentsByClass error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/*
==============================
GET ASSESSMENTS BY CLASS
==============================
*/
const getAssessmentsByClass = async (req, res) => {
  try {

    const { classId } = req.params;

    const sql = `
      SELECT
        test_id,
        test_name,
        test_type,
        test_date
      FROM test
      WHERE class_id = ?
      ORDER BY test_date DESC
    `;

    const [rows] = await db.query(sql, [classId]);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching tests" });
  }
};

module.exports = {
  createClass,
  getAllClasses,
  getMyClasses,
  getStudentsByClass,
  getAssessmentsByClass
};