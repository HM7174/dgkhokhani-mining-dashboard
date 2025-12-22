const express = require('express');
const router = express.Router();
const multer = require('multer');
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateToken);

router.get('/', attendanceController.getAttendance);
router.post('/', authorizeRoles('admin', 'site_manager'), attendanceController.markAttendance);
router.post('/bulk', authorizeRoles('admin', 'site_manager'), attendanceController.bulkAttendance);
router.post('/import', authorizeRoles('admin', 'site_manager'), upload.single('file'), attendanceController.importExcel);
router.get('/export', authorizeRoles('admin', 'site_manager'), attendanceController.exportAttendance);
router.delete('/:id', authorizeRoles('admin', 'site_manager'), attendanceController.deleteAttendance);

module.exports = router;
