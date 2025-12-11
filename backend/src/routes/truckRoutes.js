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
router.put('/:id', authorizeRoles('admin', 'site_manager'), truckController.updateTruck);
router.delete('/:id', authorizeRoles('admin'), truckController.deleteTruck);

module.exports = router;
