const db = require('../db/db');

// Get all trucks with optional filters
const getAllTrucks = async (req, res) => {
    const { type, status, site_id, include_archived } = req.query;

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

        if (include_archived !== 'true') {
            query = query.where('trucks.is_archived', false);
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
        insurance_provider, gps_device_id, site_id, status, documents, notes
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
            status: status || 'active',
            documents: JSON.stringify(documents || []),
            notes: notes || '',
            is_archived: false
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
    let updates = { ...req.body };

    // Sanitize data for PostgreSQL
    // Dates and UUIDs shouldn't be empty strings
    const fieldsToSanitize = ['puc_expiry', 'insurance_expiry', 'site_id'];
    fieldsToSanitize.forEach(field => {
        if (updates[field] === '') {
            updates[field] = null;
        }
    });

    if (updates.documents) {
        updates.documents = typeof updates.documents === 'string'
            ? updates.documents
            : JSON.stringify(updates.documents);
    }

    // Remove read-only or derived fields if they were sent
    delete updates.id;
    delete updates.created_at;
    delete updates.site_name;

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
        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
            code: error.code
        });
    }
};

// Delete truck
const deleteTruck = async (req, res) => {
    const { id } = req.params;
    try {
        // Soft delete: mark as archived
        const updatedCount = await db('trucks')
            .where({ id })
            .update({
                is_archived: true,
                site_id: null // Unassign from site when archived
            });

        if (updatedCount === 0) {
            return res.status(404).json({ error: 'Truck not found' });
        }

        res.json({ message: 'Truck archived successfully' });
    } catch (error) {
        console.error('Error archiving truck:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const restoreTruck = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedCount = await db('trucks')
            .where({ id })
            .update({ is_archived: false });

        if (updatedCount === 0) {
            return res.status(404).json({ error: 'Truck not found' });
        }
        res.json({ message: 'Truck restored successfully' });
    } catch (error) {
        console.error('Error restoring truck:', error);
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
