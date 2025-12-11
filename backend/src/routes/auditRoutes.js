const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Only admins can view audit logs
router.get('/', authorizeRoles('admin'), auditController.getAuditLogs);

module.exports = router;
