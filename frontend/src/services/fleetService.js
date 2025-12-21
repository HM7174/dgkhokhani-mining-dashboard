import api from './api';

/**
 * Fleet Service - Frontend API calls for Tata Fleet Edge data
 * 
 * Handles all API calls to our backend which proxies the Tata Fleet Edge API
 */
class FleetService {
    /**
     * Get all vehicles with real-time data
     */
    async getAllVehicles() {
        try {
            const response = await api.get('/fleet/vehicles');
            return response.data;
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            return [];
        }
    }

    /**
     * Get specific vehicle by ID
     */
    async getVehicleById(vehicleId) {
        try {
            const response = await api.get(`/fleet/vehicles/${vehicleId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching vehicle ${vehicleId}:`, error);
            return null;
        }
    }

    /**
     * Get live GPS locations for all vehicles
     */
    async getLiveLocations() {
        try {
            const response = await api.get('/fleet/live-locations');
            return response.data;
        } catch (error) {
            console.error('Error fetching live locations:', error);
            return [];
        }
    }

    /**
     * Get real-time alerts
     */
    async getAlerts() {
        try {
            const response = await api.get('/fleet/alerts');
            return response.data;
        } catch (error) {
            console.error('Error fetching alerts:', error);
            return [];
        }
    }

    /**
     * Get fleet statistics
     */
    async getStatistics() {
        try {
            const response = await api.get('/fleet/statistics');
            return response.data;
        } catch (error) {
            console.error('Error fetching statistics:', error);
            return {
                total_vehicles: 0,
                active_vehicles: 0,
                moving_vehicles: 0,
                idle_vehicles: 0,
                stopped_vehicles: 0,
                total_fuel_consumed: 0,
                average_fuel_efficiency: 0,
                total_distance: 0,
                alerts_count: 0
            };
        }
    }

    /**
     * Get rate limit status
     */
    async getRateLimitStatus() {
        try {
            const response = await api.get('/fleet/rate-limit');
            return response.data;
        } catch (error) {
            console.error('Error fetching rate limit status:', error);
            return null;
        }
    }

    /**
     * Clear cache
     */
    async clearCache() {
        try {
            const response = await api.post('/fleet/cache/clear');
            return response.data;
        } catch (error) {
            console.error('Error clearing cache:', error);
            return null;
        }
    }
}

export default new FleetService();
