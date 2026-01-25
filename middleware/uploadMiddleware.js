const multer = require('multer');
const path = require('path');

// Configure multer to process the file in memory
const storage = multer.memoryStorage();

// Middleware configuration
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Check the file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.xlsx') {
        // If the extension is not .xlsx, reject the file
        return cb(new Error('Error: Only .xlsx files are allowed!'));
    }
    // If the extension is correct, accept the file
    cb(null, true);
  }
});

module.exports = upload;