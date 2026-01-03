const express = require('express');
const router = express.Router();
const truckController = require('../controllers/truckController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public or Protected routes (depending on requirements, usually protected)
router.use(authenticateToken);

router.get('/', truckController.getAllTrucks);
router.get('/:id', truckController.getTruckById);

// Admin or Site Manager only
router.post('/', authorizeRoles('admin', 'site_manager'), truckController.createTruck);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'dispatch'), truckController.updateTruck);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), truckController.deleteTruck);
router.post('/:id/restore', authenticateToken, authorizeRoles('admin'), truckController.restoreTruck);

module.exports = router;
