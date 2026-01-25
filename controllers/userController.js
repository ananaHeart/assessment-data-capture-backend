const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/users/register
const registerUser = async (req, res) => {
  // Get data from the request body
  const { firstName, lastName, gender, dateBirth, email, password, role } = req.body;

  // Simple validation
  if (!firstName || !lastName || !email || !password || !role) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  try {
    // Check if user already exists
    const [userExists] = await db.query('SELECT email FROM user WHERE email = ?', [email]);
    if (userExists.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user into the database
    const sql = 'INSERT INTO user (first_name, last_name, gender, date_birth, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    await db.query(sql, [firstName, lastName, gender, dateBirth, email, hashedPassword, role, 'pending']);

    res.status(201).json({ message: 'User registered successfully!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @desc    Authenticate a user (login)
// @route   POST /api/users/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Step 1: Find the user by email
    const [users] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
    const user = users[0];

    // If no user is found with that email, it's an invalid login attempt
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Step 2: Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    // If the passwords do not match, it's an invalid login attempt
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // --- THIS IS THE NEW, CLEARER LOGIC ---
    // Step 3: Check the user's status AFTER confirming the password is correct
    if (user.status === 'pending') {
      return res.status(403).json({ message: 'Your account is pending approval from the principal.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Your account is not active. Please contact an administrator.' });
    }
    // ------------------------------------

    // If all checks pass, create a token and log them in
    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful!',
      token: token,
      user: {
        id: user.user_id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // --- THIS IS THE CORRECT SQL ---
    let sql = 'SELECT * FROM user'; 
    // ------------------------------
    
    const params = [];
    if (req.query.role) {
      sql += ' WHERE role = ?';
      params.push(req.query.role);
    }
    sql += ' ORDER BY last_name, first_name';

    const [users] = await db.query(sql, params);
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching users.' });
  }
};

// @desc    Delete a user by ID
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // You might want to prevent users from deleting themselves, but for now, this is okay.
    // Also, you should not be able to delete the super admin.
    if (parseInt(id) === 1) { // Assuming user_id 1 is a protected admin
      return res.status(400).json({ message: 'Cannot delete the primary admin account.' });
    }

    const [result] = await db.query('DELETE FROM user WHERE user_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    // This will catch errors if the user is linked to classes, etc.
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'Cannot delete this user because they are linked to existing classes or other records.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expecting { "status": "active" } or "inactive", etc.

    // Make sure the provided status is one of the valid options
    const validStatuses = ['pending', 'active', 'on_leave', 'inactive', 'archived'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const [result] = await db.query('UPDATE user SET status = ? WHERE user_id = ?', [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: `User status updated to ${status}.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Update a user's profile information
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const fieldsToUpdate = req.body;

    // Check if there's anything to update
    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: 'No fields to update provided.' });
    }
    
    // --- THIS IS THE SMART LOGIC ---
    // We will build the SQL query dynamically based on the fields provided
    const updateFields = [];
    const updateValues = [];

    // Map frontend camelCase names to backend snake_case names
    const fieldMapping = {
      firstName: 'first_name',
      lastName: 'last_name',
      gender: 'gender',
      dateBirth: 'date_birth',
      email: 'email',
      role: 'role',
      status: 'status',
    };

    for (const key in fieldsToUpdate) {
      if (fieldMapping[key]) {
        updateFields.push(`${fieldMapping[key]} = ?`);
        updateValues.push(fieldsToUpdate[key]);
      }
    }
    
    // If no valid fields were provided to update
    if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No valid fields to update.' });
    }
    // ---------------------------------

    // Add the user_id to the end of our values array for the WHERE clause
    updateValues.push(id);

    const sql = `UPDATE user SET ${updateFields.join(', ')} WHERE user_id = ?`;

    const [result] = await db.query(sql, updateValues);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User profile updated successfully.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'This email address is already in use.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error while updating user.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  deleteUser,
  updateUserStatus,
  updateUser,
};

