const db = require('../config/db');

// @desc    Create a new class (Assign a teacher to a subject and section)
// @route   POST /api/classes
const createClass = async (req, res) => {
  const { academicYearId, userId, subjectId, sectionId } = req.body;

  if (!academicYearId || !userId || !subjectId || !sectionId) {
    return res.status(400).json({ message: 'Missing required fields for class creation.' });
  }

  try {
    const [existingClass] = await db.query(
      'SELECT class_id FROM class WHERE academic_year_id = ? AND subject_id = ? AND section_id = ?',
      [academicYearId, subjectId, sectionId]
    );

    if (existingClass.length > 0) {
      return res.status(409).json({ message: 'This class (subject and section) is already assigned to a teacher for this academic year.' });
    }
    
    const sql = 'INSERT INTO class (academic_year_id, user_id, original_user_id, subject_id, section_id) VALUES (?, ?, ?, ?, ?)';
    await db.query(sql, [academicYearId, userId, userId, subjectId, sectionId]);
    
    res.status(201).json({ message: 'Class created and teacher assigned successfully.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during class creation.' });
  }
};

// @desc    Get all classes with detailed information (for Principal/Admin)
// @route   GET /api/classes
const getAllClasses = async (req, res) => {
  try {
    const sql = `
      SELECT 
        c.class_id,
        ay.year_name,
        CONCAT(u.first_name, ' ', u.last_name) AS teacher_name,
        s.subject_name,
        sec.section_name,
        gl.grade_level_name
      FROM class AS c
      JOIN academic_year AS ay ON c.academic_year_id = ay.academic_year_id
      JOIN user AS u ON c.user_id = u.user_id
      JOIN subject AS s ON c.subject_id = s.subject_id
      JOIN section AS sec ON c.section_id = sec.section_id
      JOIN grade_level AS gl ON sec.grade_level_id = gl.grade_level_id
      WHERE ay.status = 'Active'
      ORDER BY gl.grade_level_name, sec.section_name, s.subject_name;
    `;
    const [classes] = await db.query(sql);
    res.status(200).json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching classes.' });
  }
};

// @desc    Get all classes for the currently logged-in teacher
// @route   GET /api/classes/my-classes
const getMyClasses = async (req, res) => {
  const teacherId = req.user.user_id; 

  try {
    const sql = `
      SELECT 
        c.class_id,
        s.subject_name,
        sec.section_name,
        gl.grade_level_name
      FROM class AS c
      JOIN subject AS s ON c.subject_id = s.subject_id
      JOIN section AS sec ON c.section_id = sec.section_id
      JOIN grade_level AS gl ON sec.grade_level_id = gl.grade_level_id
      WHERE c.user_id = ? AND c.academic_year_id = (SELECT academic_year_id FROM academic_year WHERE status = 'Active' LIMIT 1)
      ORDER BY gl.grade_level_name, sec.section_name;
    `;
    const [classes] = await db.query(sql, [teacherId]);
    res.status(200).json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching your classes.' });
  }
};


// --- THIS IS THE MOST IMPORTANT PART TO FIX ---
module.exports = {
  createClass,
  getAllClasses,
  getMyClasses, // We must export the new function here
};