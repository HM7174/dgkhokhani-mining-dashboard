const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', driverController.getAllDrivers);
router.get('/:id', driverController.getDriverById);

router.post('/', authorizeRoles('admin', 'site_manager'), driverController.createDriver);
router.put('/:id', authorizeRoles('admin', 'site_manager'), driverController.updateDriver);
router.delete('/:id', authorizeRoles('admin'), driverController.deleteDriver);

module.exports = router;
