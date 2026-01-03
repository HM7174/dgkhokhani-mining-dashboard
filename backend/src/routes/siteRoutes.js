const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', siteController.getAllSites);
router.get('/:id', siteController.getSiteById);

router.post('/', authorizeRoles('admin'), siteController.createSite);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'site_manager'), siteController.updateSite);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), siteController.deleteSite);
router.post('/:id/restore', authenticateToken, authorizeRoles('admin'), siteController.restoreSite);

module.exports = router;
