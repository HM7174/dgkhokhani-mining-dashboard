const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/db');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: fieldname-timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Upload endpoint
router.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // Read file content for database storage
        const filePath = path.join('uploads', req.file.filename);
        const fileData = fs.readFileSync(filePath);

        // Save to database for permanent storage
        await db('file_store').insert({
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            data: fileData
        });

        // Return the URL to access the file
        // We use the new /raw endpoint for permanence
        const fileUrl = `/api/upload/raw/${req.file.filename}`;

        res.json({
            message: 'File uploaded and saved to database successfully',
            url: fileUrl,
            filename: req.file.filename,
            mimetype: req.file.mimetype
        });
    } catch (error) {
        console.error('Error saving file to database:', error);
        // Still return the local URL as fallback if DB fails
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({
            message: 'File uploaded but failed to save to database',
            url: fileUrl,
            filename: req.file.filename,
            mimetype: req.file.mimetype
        });
    }
});

const fileFallback = require('../middleware/fileFallback');

// Raw file retrieval endpoint
router.get('/raw/:filename', fileFallback);

module.exports = router;
