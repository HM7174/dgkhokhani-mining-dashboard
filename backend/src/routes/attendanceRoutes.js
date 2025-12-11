const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', attendanceController.getAttendance);
router.post('/', authorizeRoles('admin', 'site_manager'), attendanceController.markAttendance);
router.post('/bulk', authorizeRoles('admin', 'site_manager'), attendanceController.bulkAttendance);

module.exports = router;
