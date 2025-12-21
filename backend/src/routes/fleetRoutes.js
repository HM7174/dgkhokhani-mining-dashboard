const express = require('express');
const router = express.Router();
const tataFleetService = require('../services/tataFleetService');
const { authenticateToken } = require('../middleware/authMiddleware');

// Apply authentication to all fleet routes
router.use(authenticateToken);

/**
 * GET /api/fleet/vehicles
 * Get all vehicles with real-time data
 */
router.get('/vehicles', async (req, res) => {
    try {
        const vehicles = await tataFleetService.getAllVehicles();
        res.json(vehicles);
    } catch (error) {
        console.error('Error in /fleet/vehicles:', error);
        res.status(500).json({ error: 'Failed to fetch vehicles from Tata Fleet Edge' });
    }
});

/**
 * GET /api/fleet/vehicles/:id
 * Get specific vehicle details
 */
router.get('/vehicles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await tataFleetService.getVehicleById(id);

        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        res.json(vehicle);
    } catch (error) {
        console.error(`Error in /fleet/vehicles/${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch vehicle details' });
    }
});

/**
 * GET /api/fleet/live-locations
 * Get real-time GPS locations for all vehicles
 */
router.get('/live-locations', async (req, res) => {
    try {
        const locations = await tataFleetService.getLiveLocations();
        res.json(locations);
    } catch (error) {
        console.error('Error in /fleet/live-locations:', error);
        res.status(500).json({ error: 'Failed to fetch live locations' });
    }
});

/**
 * GET /api/fleet/alerts
 * Get real-time alerts
 */
router.get('/alerts', async (req, res) => {
    try {
        const alerts = await tataFleetService.getAlerts();
        res.json(alerts);
    } catch (error) {
        console.error('Error in /fleet/alerts:', error);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

/**
 * GET /api/fleet/statistics
 * Get fleet statistics (total vehicles, active, fuel consumed, etc.)
 */
router.get('/statistics', async (req, res) => {
    try {
        const stats = await tataFleetService.getFleetStatistics();
        res.json(stats);
    } catch (error) {
        console.error('Error in /fleet/statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

/**
 * GET /api/fleet/rate-limit
 * Get current rate limit status
 */
router.get('/rate-limit', async (req, res) => {
    try {
        const status = tataFleetService.getRateLimitStatus();
        res.json(status);
    } catch (error) {
        console.error('Error in /fleet/rate-limit:', error);
        res.status(500).json({ error: 'Failed to fetch rate limit status' });
    }
});

/**
 * POST /api/fleet/cache/clear
 * Clear the cache (admin only - useful for testing)
 */
router.post('/cache/clear', async (req, res) => {
    try {
        tataFleetService.clearCache();
        res.json({ message: 'Cache cleared successfully' });
    } catch (error) {
        console.error('Error in /fleet/cache/clear:', error);
        res.status(500).json({ error: 'Failed to clear cache' });
    }
});

module.exports = router;
