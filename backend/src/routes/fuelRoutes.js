const express = require('express');
const router = express.Router();
const fuelController = require('../controllers/fuelController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', fuelController.getFuelLogs);
router.get('/stats', fuelController.getFuelStats);
router.post('/', authorizeRoles('admin', 'site_manager', 'dispatch'), fuelController.addFuelLog);
router.put('/:id', authorizeRoles('admin', 'site_manager', 'dispatch'), fuelController.updateFuelLog);
router.delete('/:id', authorizeRoles('admin'), fuelController.deleteFuelLog);

module.exports = router;
