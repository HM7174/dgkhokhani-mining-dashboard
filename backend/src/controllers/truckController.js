const db = require('../db/db');

// Get all trucks with optional filters
const getAllTrucks = async (req, res) => {
    const { type, status, site_id } = req.query;

    try {
        let query = db('trucks')
            .leftJoin('sites', 'trucks.site_id', 'sites.id')
            .select(
                'trucks.*',
                'sites.name as site_name'
            );

        if (type) {
            query = query.where('trucks.type', type);
        }
        if (status) {
            query = query.where('trucks.status', status);
        }
        if (site_id) {
            query = query.where('trucks.site_id', site_id);
        }

        const trucks = await query;
        res.json(trucks);
    } catch (error) {
        console.error('Error fetching trucks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get single truck by ID
const getTruckById = async (req, res) => {
    const { id } = req.params;
    try {
        const truck = await db('trucks')
            .leftJoin('sites', 'trucks.site_id', 'sites.id')
            .select('trucks.*', 'sites.name as site_name')
            .where('trucks.id', id)
            .first();

        if (!truck) {
            return res.status(404).json({ error: 'Truck not found' });
        }

        res.json(truck);
    } catch (error) {
        console.error('Error fetching truck:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create new truck
const createTruck = async (req, res) => {
    const {
        name, type, registration_number, puc_expiry, insurance_expiry,
        insurance_provider, gps_device_id, site_id, status
    } = req.body;

    try {
        const [newTruck] = await db('trucks').insert({
            name,
            type,
            registration_number,
            puc_expiry,
            insurance_expiry,
            insurance_provider,
            gps_device_id,
            site_id,
            status: status || 'active'
        }).returning('*');

        res.status(201).json(newTruck);
    } catch (error) {
        console.error('Error creating truck:', error);
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ error: 'Registration number already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update truck
const updateTruck = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const [updatedTruck] = await db('trucks')
            .where({ id })
            .update(updates)
            .returning('*');

        if (!updatedTruck) {
            return res.status(404).json({ error: 'Truck not found' });
        }

        res.json(updatedTruck);
    } catch (error) {
        console.error('Error updating truck:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete truck
const deleteTruck = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCount = await db('trucks').where({ id }).del();

        if (deletedCount === 0) {
            return res.status(404).json({ error: 'Truck not found' });
        }

        res.json({ message: 'Truck deleted successfully' });
    } catch (error) {
        console.error('Error deleting truck:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllTrucks,
    getTruckById,
    createTruck,
    updateTruck,
    deleteTruck
};
