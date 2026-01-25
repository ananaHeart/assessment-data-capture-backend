const db = require('../config/db');

// @desc    Create a new Academic Year
// @route   POST /api/school/academic-years
const createAcademicYear = async (req, res) => {
  const { yearName, startDate, endDate, status } = req.body;
  if (!yearName || !startDate || !endDate) {
    return res.status(400).json({ message: 'Please provide year name, start date, and end date.' });
  }

  try {
    const sql = 'INSERT INTO academic_year (year_name, start_date, end_date, status) VALUES (?, ?, ?, ?)';
    await db.query(sql, [yearName, startDate, endDate, status || 'Planning']);
    res.status(201).json({ message: 'Academic year created successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get all Academic Years
// @route   GET /api/school/academic-years
const getAllAcademicYears = async (req, res) => {
  try {
    const [years] = await db.query('SELECT * FROM academic_year ORDER BY start_date DESC');
    res.status(200).json(years);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get a single Academic Year by ID
// @route   GET /api/school/academic-years/:id
const getAcademicYearById = async (req, res) => {
  try {
    const { id } = req.params;
    const [year] = await db.query('SELECT * FROM academic_year WHERE academic_year_id = ?', [id]);
    
    if (year.length === 0) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }
    res.status(200).json(year[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Update an Academic Year
// @route   PUT /api/school/academic-years/:id
const updateAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    const { yearName, startDate, endDate, status } = req.body;

    // First, check if the year exists
    const [yearExists] = await db.query('SELECT * FROM academic_year WHERE academic_year_id = ?', [id]);
    if (yearExists.length === 0) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }

    const sql = 'UPDATE academic_year SET year_name = ?, start_date = ?, end_date = ?, status = ? WHERE academic_year_id = ?';
    await db.query(sql, [yearName, startDate, endDate, status, id]);
    
    res.status(200).json({ message: 'Academic year updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Delete an Academic Year
// @route   DELETE /api/school/academic-years/:id
const deleteAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the year exists before trying to delete
    const [yearExists] = await db.query('SELECT * FROM academic_year WHERE academic_year_id = ?', [id]);
    if (yearExists.length === 0) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }

    // IMPORTANT NOTE: Deleting an academic year can be dangerous if it's linked to other data.
    // The database constraints should handle it, but in a real system, we might prefer to "soft delete" (change status to 'archived').
    // For this project, a direct DELETE is okay.
    await db.query('DELETE FROM academic_year WHERE academic_year_id = ?', [id]);
    
    res.status(200).json({ message: 'Academic year deleted successfully.' });
  } catch (error) {
    console.error(error);
    // If the delete fails due to foreign key constraints, send a specific message
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'Cannot delete this academic year because it is currently linked to classes or enrollments.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Create a new Grade Level
// @route   POST /api/school/grade-levels
const createGradeLevel = async (req, res) => {
  const { gradeLevelName } = req.body;
  if (!gradeLevelName) {
    return res.status(400).json({ message: 'Please provide a grade level name.' });
  }

  try {
    const sql = 'INSERT INTO grade_level (grade_level_name) VALUES (?)';
    await db.query(sql, [gradeLevelName]);
    res.status(201).json({ message: 'Grade level created successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get all Grade Levels
// @route   GET /api/school/grade-levels
const getAllGradeLevels = async (req, res) => {
  try {
    const [levels] = await db.query('SELECT * FROM grade_level');
    res.status(200).json(levels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getGradeLevelById = async (req, res) => {
  try {
    const { id } = req.params;
    const [levels] = await db.query('SELECT * FROM grade_level WHERE grade_level_id = ?', [id]);
    if (levels.length === 0) {
      return res.status(404).json({ message: 'Grade level not found.' });
    }
    res.status(200).json(levels[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Update a Grade Level
// @route   PUT /api/school/grade-levels/:id
const updateGradeLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { gradeLevelName } = req.body;
    if (!gradeLevelName) {
      return res.status(400).json({ message: 'Grade level name is required.' });
    }
    await db.query('UPDATE grade_level SET grade_level_name = ? WHERE grade_level_id = ?', [gradeLevelName, id]);
    res.status(200).json({ message: 'Grade level updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Delete a Grade Level
// @route   DELETE /api/school/grade-levels/:id
const deleteGradeLevel = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM grade_level WHERE grade_level_id = ?', [id]);
    res.status(200).json({ message: 'Grade level deleted successfully.' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Cannot delete this grade level because it is linked to sections or a curriculum.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Create a new Subject
// @route   POST /api/school/subjects
const createSubject = async (req, res) => {
  const { subjectCode, subjectName } = req.body;
  if (!subjectName) {
    return res.status(400).json({ message: 'Please provide a subject name.' });
  }

  try {
    const sql = 'INSERT INTO subject (subject_code, subject_name) VALUES (?, ?)';
    await db.query(sql, [subjectCode, subjectName]);
    res.status(201).json({ message: 'Subject created successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get all Subjects
// @route   GET /api/school/subjects
const getAllSubjects = async (req, res) => {
  try {
    const [subjects] = await db.query('SELECT * FROM subject ORDER BY subject_name');
    res.status(200).json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get a single Subject by ID
// @route   GET /api/school/subjects/:id
const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const [subjects] = await db.query('SELECT * FROM subject WHERE subject_id = ?', [id]);
    
    if (subjects.length === 0) {
      return res.status(404).json({ message: 'Subject not found.' });
    }
    res.status(200).json(subjects[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Update a Subject
// @route   PUT /api/school/subjects/:id
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    // We get subjectCode and subjectName from the body.
    // subjectCode can be null or undefined if not provided.
    const { subjectCode, subjectName } = req.body;

    if (!subjectName) {
      return res.status(400).json({ message: 'Subject name is required.' });
    }

    const [subjectExists] = await db.query('SELECT * FROM subject WHERE subject_id = ?', [id]);
    if (subjectExists.length === 0) {
      return res.status(404).json({ message: 'Subject not found.' });
    }

    // This query will now correctly handle a null or empty subjectCode
    const sql = 'UPDATE subject SET subject_code = ?, subject_name = ? WHERE subject_id = ?';
    await db.query(sql, [subjectCode || null, subjectName, id]);
    
    res.status(200).json({ message: 'Subject updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Delete a Subject
// @route   DELETE /api/school/subjects/:id
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const [subjectExists] = await db.query('SELECT * FROM subject WHERE subject_id = ?', [id]);
    if (subjectExists.length === 0) {
      return res.status(404).json({ message: 'Subject not found.' });
    }

    await db.query('DELETE FROM subject WHERE subject_id = ?', [id]);
    
    res.status(200).json({ message: 'Subject deleted successfully.' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'Cannot delete this subject because it is linked to a curriculum or class.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const createSection = async (req, res) => {
    const { sectionName, gradeLevelId } = req.body;
    if (!sectionName || !gradeLevelId) {
      return res.status(400).json({ message: 'Please provide a section name and a grade level ID.' });
    }
    try {
      await db.query('INSERT INTO section (section_name, grade_level_id) VALUES (?, ?)', [sectionName, gradeLevelId]);
      res.status(201).json({ message: 'Section created successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error.' });
    }
  };

const getAllSections = async (req, res) => {
    try {
      const sql = `
        SELECT s.section_id, s.section_name, s.grade_level_id, gl.grade_level_name 
        FROM section AS s
        JOIN grade_level AS gl ON s.grade_level_id = gl.grade_level_id
        ORDER BY gl.grade_level_id, s.section_name;
      `;
      const [sections] = await db.query(sql);
      res.status(200).json(sections);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error.' });
    }
  };


// @desc    Get a single Section by ID
// @route   GET /api/school/sections/:id
const getSectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const [sections] = await db.query('SELECT * FROM section WHERE section_id = ?', [id]);
    if (sections.length === 0) {
      return res.status(404).json({ message: 'Section not found.' });
    }
    res.status(200).json(sections[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Update a Section
// @route   PUT /api/school/sections/:id
const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionName, gradeLevelId } = req.body;
    if (!sectionName || !gradeLevelId) {
      return res.status(400).json({ message: 'Section name and grade level ID are required.' });
    }
    await db.query('UPDATE section SET section_name = ?, grade_level_id = ? WHERE section_id = ?', [sectionName, gradeLevelId, id]);
    res.status(200).json({ message: 'Section updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Delete a Section
// @route   DELETE /api/school/sections/:id
const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM section WHERE section_id = ?', [id]);
    res.status(200).json({ message: 'Section deleted successfully.' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Cannot delete this section because it is linked to student enrollments or classes.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const createCurriculumEntry = async (req, res) => {
  const { gradeLevelId, subjectId } = req.body;
  if (!gradeLevelId || !subjectId) {
    return res.status(400).json({ message: 'Please provide a grade level ID and a subject ID.' });
  }

  try {
    // Check if this link already exists to avoid duplicates
    const [existing] = await db.query('SELECT curriculum_id FROM curriculum WHERE grade_level_id = ? AND subject_id = ?', [gradeLevelId, subjectId]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'This subject is already linked to this grade level.' });
    }

    const sql = 'INSERT INTO curriculum (grade_level_id, subject_id) VALUES (?, ?)';
    await db.query(sql, [gradeLevelId, subjectId]);
    res.status(201).json({ message: 'Curriculum entry created successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get All Curriculum Entries (The entire linking table)
// @route   GET /api/school/curriculum
const getAllCurriculum = async (req, res) => {
  try {
    const sql = `
      SELECT 
        c.curriculum_id,
        c.grade_level_id,
        gl.grade_level_name,
        c.subject_id,
        s.subject_name
      FROM curriculum AS c
      JOIN grade_level AS gl ON c.grade_level_id = gl.grade_level_id
      JOIN subject AS s ON c.subject_id = s.subject_id
      ORDER BY c.curriculum_id;
    `;
    const [entries] = await db.query(sql);
    res.status(200).json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getCurriculumByGrade = async (req, res) => {
  try {
    const { gradeLevelId } = req.params;
    const sql = `
      SELECT 
        s.subject_id, 
        s.subject_code, 
        s.subject_name,
        c.curriculum_id -- Also return the linking ID for deletion purposes
      FROM curriculum AS c
      JOIN subject AS s ON c.subject_id = s.subject_id
      WHERE c.grade_level_id = ?
      ORDER BY s.subject_name;
    `;
    const [subjects] = await db.query(sql, [gradeLevelId]);
    res.status(200).json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};
  
// @desc    Delete a Curriculum Entry (Unlink Subject from Grade Level)
// @route   DELETE /api/school/curriculum
const deleteCurriculumEntry = async (req, res) => {
  const { gradeLevelId, subjectId } = req.body;
  if (!gradeLevelId || !subjectId) {
    return res.status(400).json({ message: 'Please provide both gradeLevelId and subjectId.' });
  }

  try {
    const sql = 'DELETE FROM curriculum WHERE grade_level_id = ? AND subject_id = ?';
    const [result] = await db.query(sql, [gradeLevelId, subjectId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Curriculum entry not found.' });
    }

    res.status(200).json({ message: 'Curriculum entry deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};
const getActiveAcademicYear = async (req, res) => {
  try {
    const [year] = await db.query("SELECT * FROM academic_year WHERE status = 'Active' LIMIT 1");
    if (year.length === 0) {
      return res.status(404).json({ message: 'No active academic year found.' });
    }
    res.status(200).json(year[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Update a Curriculum Entry by its unique ID
// @route   PUT /api/school/curriculum/:id
const updateCurriculumEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { gradeLevelId, subjectId } = req.body;

    if (!gradeLevelId || !subjectId) {
      return res.status(400).json({ message: 'Please provide both gradeLevelId and subjectId.' });
    }

    // Check if the curriculum entry exists
    const [entryExists] = await db.query('SELECT * FROM curriculum WHERE curriculum_id = ?', [id]);
    if (entryExists.length === 0) {
      return res.status(404).json({ message: 'Curriculum entry not found.' });
    }

    const sql = 'UPDATE curriculum SET grade_level_id = ?, subject_id = ? WHERE curriculum_id = ?';
    await db.query(sql, [gradeLevelId, subjectId, id]);
    
    res.status(200).json({ message: 'Curriculum entry updated successfully.' });
  } catch (error) {
    // Check for duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'This subject is already linked to this grade level.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }

  
};


module.exports = {
  createAcademicYear,
  getAllAcademicYears,
  getAcademicYearById, // <-- ADD THIS
  updateAcademicYear, // <-- ADD THIS
  deleteAcademicYear, // <-- ADD THIS
  createGradeLevel,
  getAllGradeLevels,
  getGradeLevelById,   // <-- ADD
  updateGradeLevel,    // <-- ADD
  deleteGradeLevel,    // <-- ADD
  createSubject,
  getAllSubjects,
  getSubjectById,    // <-- ADD THIS
  updateSubject,     // <-- ADD THIS
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
  getActiveAcademicYear
};