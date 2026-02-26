/**
 * Multer File Upload Middleware
 * Handles PDF and DOCX file uploads with validation.
 */
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Storage configuration
const os = require('os');
const isVercel = process.env.VERCEL === '1';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Vercel only allows writing to /tmp
        const dir = isVercel ? '/tmp' : path.join(__dirname, '..', 'uploads');
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    },
});

// File filter — only allow PDF and DOCX
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const allowedExts = ['.pdf', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
};

// Multer instance
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB max
    },
});

module.exports = upload;
