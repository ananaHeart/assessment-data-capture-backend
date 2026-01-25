const express = require('express');
const cors = require('cors'); // <-- ADD THIS LINE
require('dotenv').config();

// Route imports
const userRoutes = require('./routes/userRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const classRoutes = require('./routes/classRoutes');
const testRoutes = require('./routes/testRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// --- MIDDLEWARE ---

// Use CORS middleware - THIS IS THE FIX
// This will allow requests from your frontend development server
app.use(cors()); // <-- ADD THIS LINE

// Middleware to parse JSON bodies
app.use(express.json());

// --- ROUTES ---
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Assessment Data Capture API!" });
});

app.use('/api/users', userRoutes);
app.use('/api/school', schoolRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/tests', testRoutes);

// --- SERVER START ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});