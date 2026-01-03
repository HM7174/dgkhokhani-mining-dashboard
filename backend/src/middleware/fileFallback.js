const path = require('path');
const fs = require('fs');
const db = require('../db/db');

/**
 * Middleware to serve files from local storage, with fallback to database
 */
const fileFallback = async (req, res, next) => {
    const filename = req.params.filename;
    const localPath = path.join(__dirname, '../../uploads', filename);

    // 1. Try serving from local disk first (faster)
    if (fs.existsSync(localPath)) {
        return res.sendFile(localPath);
    }

    // 2. If not on disk, try finding in database
    try {
        const fileRecord = await db('file_store').where({ filename }).first();

        if (fileRecord) {
            res.set('Content-Type', fileRecord.mimetype);
            return res.send(fileRecord.data);
        }
    } catch (error) {
        console.error('Error retrieving file from database fallback:', error);
        // If the table doesn't exist, we just fall through to 404
    }

    // 3. Not found anywhere
    res.status(404).json({ error: 'File not found' });
};

module.exports = fileFallback;
