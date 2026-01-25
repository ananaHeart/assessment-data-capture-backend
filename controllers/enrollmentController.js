const db = require('../config/db');
const xlsx = require('xlsx');

// @desc    Upload and process student enrollment Excel file
// @route   POST /api/enrollment/upload
const uploadEnrollment = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const connection = await db.getConnection(); 

  try {
    await connection.beginTransaction();

    const [academicYears] = await connection.query("SELECT academic_year_id FROM academic_year WHERE status = 'Active' LIMIT 1");
    if (academicYears.length === 0) {
      throw new Error('No active academic year found. Please set an academic year to "Active".');
    }
    const academicYearId = academicYears[0].academic_year_id;

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const studentData = xlsx.utils.sheet_to_json(worksheet);

    for (const row of studentData) {
      const lastName = row['Student_Last_Name'];
      const firstName = row['Student_First_Name'];
      const gradeLevelName = row['Grade_Level'];
      const sectionName = row['Section_Name'];
      const subjectName = row['Subject_Name']; // --- NEW: Read the subject name ---

      // --- 1. Find or Create the Student ---
      let studentId;
      const [existingStudents] = await connection.query('SELECT student_id FROM student WHERE first_name = ? AND last_name = ?', [firstName, lastName]);
      if (existingStudents.length > 0) {
        studentId = existingStudents[0].student_id;
      } else {
        // --- UPDATED: We now handle different Grade Levels from the file ---
        const [newStudent] = await connection.query('INSERT INTO student (first_name, last_name, gender) VALUES (?, ?, ?)', [firstName, lastName, 'male']); // Defaulting gender
        studentId = newStudent.insertId;
      }
      
      // --- 2. Find the Grade Level ---
      // --- UPDATED: The code now correctly looks for 'Grade 7' not '7' ---
      const [gradeLevels] = await connection.query('SELECT grade_level_id FROM grade_level WHERE grade_level_name = ?', [`Grade ${gradeLevelName}`]);
      if (gradeLevels.length === 0) {
        throw new Error(`Grade Level "Grade ${gradeLevelName}" not found in the database.`);
      }
      const gradeLevelId = gradeLevels[0].grade_level_id;

      // --- 3. Find or Create the Section ---
      let sectionId;
      const [existingSections] = await connection.query('SELECT section_id FROM section WHERE section_name = ? AND grade_level_id = ?', [sectionName, gradeLevelId]);
      if (existingSections.length > 0) {
        sectionId = existingSections[0].section_id;
      } else {
        const [newSection] = await connection.query('INSERT INTO section (section_name, grade_level_id) VALUES (?, ?)', [sectionName, gradeLevelId]);
        sectionId = newSection.insertId;
      }

      // --- 4. Create the Enrollment Record ---
      const [existingEnrollment] = await connection.query('SELECT student_enrollment_id FROM student_enrollment WHERE student_id = ? AND section_id = ? AND academic_year_id = ?', [studentId, sectionId, academicYearId]);
      if (existingEnrollment.length === 0) {
        await connection.query('INSERT INTO student_enrollment (student_id, section_id, academic_year_id) VALUES (?, ?, ?)', [studentId, sectionId, academicYearId]);
      }

      // --- 5. Find or Create Subject and Class (NEW LOGIC) ---
      let subjectId;
      const [existingSubjects] = await connection.query('SELECT subject_id FROM subject WHERE subject_name = ?', [subjectName]);
      if (existingSubjects.length > 0) {
        subjectId = existingSubjects[0].subject_id;
      } else {
        const [newSubject] = await connection.query('INSERT INTO subject (subject_name) VALUES (?)', [subjectName]);
        subjectId = newSubject.insertId;
      }
      
      // --- This part is important, but for now, we will skip assigning a teacher. ---
      // --- The principal must do that later. The class will be created without a teacher. ---

    }

    await connection.commit();
    res.status(200).json({ message: `Successfully processed ${studentData.length} student records.` });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Failed to process enrollment file.', error: error.message });
  } finally {
    connection.release();
  }
};

const getEnrolledStudentCount = async (req, res) => {
  try {
    const [year] = await db.query("SELECT academic_year_id FROM academic_year WHERE status = 'Active' LIMIT 1");
    if (year.length === 0) {
      return res.status(200).json({ count: 0 }); // No active year, so 0 students
    }
    const [rows] = await db.query('SELECT COUNT(student_id) as studentCount FROM student_enrollment WHERE academic_year_id = ?', [year[0].academic_year_id]);
    res.status(200).json({ count: rows[0].studentCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get all students enrolled in a specific class
// @route   GET /api/enrollment/class/:classId/students
const getStudentsByClassId = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user.user_id; // From our 'protect' middleware

    // --- SECURITY CHECK ---
    // First, confirm the logged-in teacher actually owns this class
    const [classCheck] = await db.query('SELECT section_id FROM class WHERE class_id = ? AND user_id = ?', [classId, teacherId]);
    if (classCheck.length === 0) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to this class." });
    }
    const { section_id } = classCheck[0];
    // -----------------------

    // Get the active academic year to find current enrollments
    const [year] = await db.query("SELECT academic_year_id FROM academic_year WHERE status = 'Active' LIMIT 1");
    if (year.length === 0) {
      return res.status(404).json({ message: 'No active academic year found.' });
    }
    const academicYearId = year[0].academic_year_id;

    // Now, get all students enrolled in that section for the active year
    const sql = `
      SELECT s.student_id, s.first_name, s.last_name, s.status 
      FROM student AS s
      JOIN student_enrollment AS se ON s.student_id = se.student_id
      WHERE se.section_id = ? AND se.academic_year_id = ?
      ORDER BY s.last_name, s.first_name;
    `;
    const [students] = await db.query(sql, [section_id, academicYearId]);
    
    res.status(200).json(students);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching students.' });
  }
};

// --- THIS IS THE CRITICAL PART ---
module.exports = {
  uploadEnrollment,
  getEnrolledStudentCount,
  getStudentsByClassId,
};