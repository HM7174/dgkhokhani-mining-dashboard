const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', siteController.getAllSites);
router.get('/:id', siteController.getSiteById);

router.post('/', authorizeRoles('admin'), siteController.createSite);
router.put('/:id', authorizeRoles('admin'), siteController.updateSite);
router.delete('/:id', authorizeRoles('admin'), siteController.deleteSite);

module.exports = router;
