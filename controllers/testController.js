const db = require('../config/db');

// Helper function for security checks to avoid repeating code
const checkTestOwnership = async (testId, teacherId) => {
  const [tests] = await db.query(
    `SELECT t.test_id FROM test t JOIN class c ON t.class_id = c.class_id WHERE t.test_id = ? AND c.user_id = ?`,
    [testId, teacherId]
  );
  return tests.length > 0;
};


// @desc    Get all tests for a specific class
// @route   GET /api/tests/class/:classId
const getTestsByClass = async (req, res) => {
  // ... (This function remains the same as before)
  const { classId } = req.params;
  const teacherId = req.user.user_id;

  try {
    const [classCheck] = await db.query('SELECT user_id FROM class WHERE class_id = ? AND user_id = ?', [classId, teacherId]);
    if (classCheck.length === 0) {
      return res.status(403).json({ message: "You are not authorized to access this class's tests." });
    }

    const [tests] = await db.query('SELECT * FROM test WHERE class_id = ? ORDER BY test_date DESC', [classId]);
    res.status(200).json(tests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching tests.' });
  }
};

// @desc    Create a new test for a class
// @route   POST /api/tests
const createTest = async (req, res) => {
  // ... (This function remains the same as before)
  const { classId, testName, testType, testDate } = req.body;
  const teacherId = req.user.user_id;

  try {
    const [classCheck] = await db.query('SELECT user_id FROM class WHERE class_id = ? AND user_id = ?', [classId, teacherId]);
    if (classCheck.length === 0) {
      return res.status(403).json({ message: "You can only create tests for your own classes." });
    }
    
    const sql = 'INSERT INTO test (class_id, test_name, test_type, test_date) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(sql, [classId, testName, testType, testDate]);
    
    res.status(201).json({ message: 'Test created successfully.', testId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating test.' });
  }
};

// --- NEW FUNCTIONS START HERE ---

// @desc    Create a new part for a test
// @route   POST /api/tests/:testId/parts
const createTestPart = async (req, res) => {
  const { testId } = req.params;
  const teacherId = req.user.user_id;
  const { partName, partType, instruction, numberOfItems, pointsPerItem } = req.body;

  try {
    // Security Check: Make sure the logged-in teacher owns this test
    if (!(await checkTestOwnership(testId, teacherId))) {
      return res.status(403).json({ message: 'You are not authorized to modify this test.' });
    }

    const sql = 'INSERT INTO test_part (test_id, part_name, part_type, instruction, number_of_items, points_per_item) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [testId, partName, partType, instruction, numberOfItems, pointsPerItem]);

    res.status(201).json({ message: 'Test part created successfully.', testPartId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating test part.' });
  }
};

// @desc    Create a new question for a test part
// @route   POST /api/tests/parts/:partId/questions
const createQuestion = async (req, res) => {
  const { partId } = req.params;
  const teacherId = req.user.user_id;
  const { itemNumber, questionText, correctAnswer } = req.body;

  try {
    // Security Check: Find the test this part belongs to and check its ownership
    const [partCheck] = await db.query('SELECT test_id FROM test_part WHERE test_part_id = ?', [partId]);
    if (partCheck.length === 0) {
      return res.status(404).json({ message: 'Test part not found.' });
    }
    if (!(await checkTestOwnership(partCheck[0].test_id, teacherId))) {
      return res.status(403).json({ message: 'You are not authorized to add questions to this test.' });
    }
    
    const sql = 'INSERT INTO question (test_part_id, item_number, question_text, correct_answer) VALUES (?, ?, ?, ?)';
    await db.query(sql, [partId, itemNumber, questionText, correctAnswer]);

    res.status(201).json({ message: 'Question added successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding question.' });
  }
};

// @desc    Get a full test with all its parts and questions
// @route   GET /api/tests/:testId/details
const getTestDetails = async (req, res) => {
  const { testId } = req.params;
  const teacherId = req.user.user_id;

  try {
    if (!(await checkTestOwnership(testId, teacherId))) {
      return res.status(403).json({ message: 'You are not authorized to view this test.' });
    }

    // Get basic test info
    const [tests] = await db.query('SELECT * FROM test WHERE test_id = ?', [testId]);
    if (tests.length === 0) {
      return res.status(404).json({ message: 'Test not found.' });
    }
    const testDetails = tests[0];

    // Get all parts for this test
    const [parts] = await db.query('SELECT * FROM test_part WHERE test_id = ? ORDER BY test_part_id', [testId]);
    
    // For each part, get all its questions
    for (let i = 0; i < parts.length; i++) {
      const [questions] = await db.query('SELECT * FROM question WHERE test_part_id = ? ORDER BY item_number', [parts[i].test_part_id]);
      parts[i].questions = questions; // Attach questions to their respective part
    }

    testDetails.parts = parts; // Attach the parts (with questions) to the main test object

    res.status(200).json(testDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching test details.' });
  }
};


module.exports = {
  getTestsByClass,
  createTest,
  createTestPart,
  createQuestion,
  getTestDetails,
};