// assessment-backend/controllers/userManagementController.js
const db = require('../config/db');

// @desc    Get all users by a specific role
// @route   GET /api/users?role=teacher
const getUsersByRole = async (req, res) => {
  const { role } = req.query; // e.g., ?role=teacher

  if (!role) {
    return res.status(400).json({ message: 'Role query parameter is required.' });
  }

  try {
    const [users] = await db.query('SELECT user_id, first_name, last_name, email, status FROM user WHERE role = ?', [role]);
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
};

module.exports = { getUsersByRole };