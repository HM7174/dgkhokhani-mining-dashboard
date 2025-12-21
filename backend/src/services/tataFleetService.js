const axios = require('axios');
const NodeCache = require('node-cache');

/**
 * Tata Fleet Edge API Service
 * 
 * Rate Limits: Maximum 60 requests per hour (1 request per minute recommended)
 * 
 * This service handles all interactions with the Tata Fleet Edge API
 * with built-in caching and rate limiting to optimize API usage.
 */
class TataFleetService {
    constructor() {
        // Cache with 60-second TTL to respect rate limits
        this.cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

        // API Configuration
        this.baseURL = process.env.TATA_FLEET_API_URL || 'https://api.tatafleetedge.com/v1';
        this.apiKey = process.env.TATA_FLEET_API_KEY || '';
        this.authToken = process.env.TATA_FLEET_AUTH_TOKEN || '';

        // Rate limiting: Track request timestamps
        this.requestTimestamps = [];
        this.maxRequestsPerHour = 60;

        // Axios client with default config
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.authToken}`,
                'X-API-Key': this.apiKey
            }
        });
    }

    /**
     * Check if we can make a request based on rate limits
     */
    canMakeRequest() {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);

        // Remove timestamps older than 1 hour
        this.requestTimestamps = this.requestTimestamps.filter(timestamp => timestamp > oneHourAgo);

        // Check if we're under the limit
        return this.requestTimestamps.length < this.maxRequestsPerHour;
    }

    /**
     * Track a new request
     */
    trackRequest() {
        this.requestTimestamps.push(Date.now());
    }

    /**
     * Make an API request with caching and rate limiting
     */
    async makeRequest(endpoint, cacheKey, ttl = 60) {
        // Check cache first
        const cachedData = this.cache.get(cacheKey);
        if (cachedData !== undefined) {
            console.log(`Cache hit for: ${cacheKey}`);
            return cachedData;
        }

        // Check rate limit
        if (!this.canMakeRequest()) {
            console.warn('Rate limit reached. Using cached data or returning empty.');
            return null;
        }

        try {
            // Make the request
            this.trackRequest();
            const response = await this.client.get(endpoint);

            // Cache the response
            this.cache.set(cacheKey, response.data, ttl);

            return response.data;
        } catch (error) {
            console.error(`Error fetching from Tata Fleet API (${endpoint}):`, error.message);

            // Return cached data if available, even if expired
            const staleData = this.cache.get(cacheKey);
            if (staleData) {
                console.log('Returning stale cached data due to API error');
                return staleData;
            }

            throw error;
        }
    }

    /**
     * Get all vehicles from the fleet
     */
    async getAllVehicles() {
        try {
            const data = await this.makeRequest('/vehicles', 'all_vehicles', 90);

            // Transform API response to our format
            if (!data) return [];

            return this.transformVehicles(data);
        } catch (error) {
            console.error('Error getting all vehicles:', error.message);
            return [];
        }
    }

    /**
     * Get live GPS locations for all vehicles
     */
    async getLiveLocations() {
        try {
            const data = await this.makeRequest('/vehicles/locations', 'live_locations', 60);

            if (!data) return [];

            return this.transformLocations(data);
        } catch (error) {
            console.error('Error getting live locations:', error.message);
            return [];
        }
    }

    /**
     * Get specific vehicle details by ID
     */
    async getVehicleById(vehicleId) {
        try {
            const data = await this.makeRequest(`/vehicles/${vehicleId}`, `vehicle_${vehicleId}`, 90);

            if (!data) return null;

            return this.transformVehicle(data);
        } catch (error) {
            console.error(`Error getting vehicle ${vehicleId}:`, error.message);
            return null;
        }
    }

    /**
     * Get real-time alerts
     */
    async getAlerts() {
        try {
            const data = await this.makeRequest('/alerts', 'fleet_alerts', 60);

            if (!data) return [];

            return this.transformAlerts(data);
        } catch (error) {
            console.error('Error getting alerts:', error.message);
            return [];
        }
    }

    /**
     * Get fleet statistics
     */
    async getFleetStatistics() {
        try {
            const data = await this.makeRequest('/statistics', 'fleet_statistics', 120);

            if (!data) return this.getDefaultStatistics();

            return this.transformStatistics(data);
        } catch (error) {
            console.error('Error getting fleet statistics:', error.message);
            return this.getDefaultStatistics();
        }
    }

    /**
     * Transform vehicle data from Tata Fleet API format to our format
     */
    transformVehicles(apiData) {
        // This transformation will depend on the actual API response structure
        // Placeholder transformation - update based on actual API response
        if (Array.isArray(apiData)) {
            return apiData.map(vehicle => this.transformVehicle(vehicle));
        }

        if (apiData.vehicles && Array.isArray(apiData.vehicles)) {
            return apiData.vehicles.map(vehicle => this.transformVehicle(vehicle));
        }

        return [];
    }

    /**
     * Transform single vehicle
     */
    transformVehicle(vehicle) {
        return {
            id: vehicle.id || vehicle.vehicleId || vehicle.registration_no,
            registration_no: vehicle.registration_no || vehicle.registrationNumber || vehicle.vehicleNumber,
            make: vehicle.make || vehicle.manufacturer,
            model: vehicle.model,
            status: vehicle.status || this.mapStatus(vehicle.state),
            location: {
                lat: vehicle.latitude || vehicle.location?.lat,
                lng: vehicle.longitude || vehicle.location?.lng,
                address: vehicle.address || vehicle.location?.address
            },
            speed: vehicle.speed || 0,
            odometer: vehicle.odometer || vehicle.totalDistance || 0,
            fuel_level: vehicle.fuelLevel || vehicle.fuel_percentage || 0,
            driver: vehicle.driver || vehicle.driverName,
            last_updated: vehicle.lastUpdated || vehicle.timestamp || new Date().toISOString(),
            ignition: vehicle.ignition || vehicle.engineStatus === 'ON',
            raw_data: vehicle // Keep original for debugging
        };
    }

    /**
     * Transform location data
     */
    transformLocations(apiData) {
        if (Array.isArray(apiData)) {
            return apiData.map(loc => ({
                vehicle_id: loc.vehicleId || loc.registration_no,
                lat: loc.latitude || loc.lat,
                lng: loc.longitude || loc.lng,
                speed: loc.speed || 0,
                heading: loc.heading || loc.direction || 0,
                timestamp: loc.timestamp || new Date().toISOString()
            }));
        }

        return [];
    }

    /**
     * Transform alerts
     */
    transformAlerts(apiData) {
        if (Array.isArray(apiData)) {
            return apiData.map(alert => ({
                id: alert.id || alert.alertId,
                vehicle_id: alert.vehicleId || alert.vehicle_id,
                type: alert.type || alert.alertType,
                severity: alert.severity || 'medium',
                message: alert.message || alert.description,
                timestamp: alert.timestamp || alert.created_at || new Date().toISOString()
            }));
        }

        if (apiData.alerts && Array.isArray(apiData.alerts)) {
            return this.transformAlerts(apiData.alerts);
        }

        return [];
    }

    /**
     * Transform statistics
     */
    transformStatistics(apiData) {
        return {
            total_vehicles: apiData.totalVehicles || apiData.total_vehicles || 0,
            active_vehicles: apiData.activeVehicles || apiData.active_vehicles || 0,
            moving_vehicles: apiData.movingVehicles || apiData.moving || 0,
            idle_vehicles: apiData.idleVehicles || apiData.idle || 0,
            stopped_vehicles: apiData.stoppedVehicles || apiData.stopped || 0,
            total_fuel_consumed: apiData.totalFuelConsumed || apiData.fuel_consumed || 0,
            average_fuel_efficiency: apiData.avgFuelEfficiency || apiData.fuel_efficiency || 0,
            total_distance: apiData.totalDistance || apiData.distance_covered || 0,
            alerts_count: apiData.alertsCount || apiData.total_alerts || 0
        };
    }

    /**
     * Map Tata Fleet status to our status
     */
    mapStatus(state) {
        const statusMap = {
            'moving': 'active',
            'idle': 'idle',
            'stopped': 'idle',
            'running': 'active',
            'parked': 'idle',
            'offline': 'offline',
            'maintenance': 'maintenance'
        };

        return statusMap[state?.toLowerCase()] || 'unknown';
    }

    /**
     * Get default statistics when API is unavailable
     */
    getDefaultStatistics() {
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

    /**
     * Clear cache (useful for testing or manual refresh)
     */
    clearCache() {
        this.cache.flushAll();
        console.log('Cache cleared');
    }

    /**
     * Get rate limit status
     */
    getRateLimitStatus() {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        this.requestTimestamps = this.requestTimestamps.filter(timestamp => timestamp > oneHourAgo);

        return {
            requests_made: this.requestTimestamps.length,
            requests_remaining: this.maxRequestsPerHour - this.requestTimestamps.length,
            max_requests_per_hour: this.maxRequestsPerHour,
            reset_time: this.requestTimestamps.length > 0
                ? new Date(this.requestTimestamps[0] + (60 * 60 * 1000)).toISOString()
                : new Date(now + (60 * 60 * 1000)).toISOString()
        };
    }
}

// Export singleton instance
module.exports = new TataFleetService();
