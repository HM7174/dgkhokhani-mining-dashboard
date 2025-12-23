const db = require('../db/db');

const getAllDrivers = async (req, res) => {
    try {
        const drivers = await db('drivers')
            .leftJoin('trucks', 'drivers.assigned_truck_id', 'trucks.id')
            .select('drivers.*', 'trucks.name as assigned_truck_name');
        res.json(drivers);
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getDriverById = async (req, res) => {
    const { id } = req.params;
    try {
        const driver = await db('drivers')
            .leftJoin('trucks', 'drivers.assigned_truck_id', 'trucks.id')
            .select('drivers.*', 'trucks.name as assigned_truck_name')
            .where('drivers.id', id)
            .first();

        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }
        res.json(driver);
    } catch (error) {
        console.error('Error fetching driver:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createDriver = async (req, res) => {
    const {
        full_name, phone, aadhar_number, pan_number, license_number,
        license_expiry, bank_name, bank_account_last4, assigned_truck_id,
        employment_status, documents, photo_url, post
    } = req.body;

    try {
        const [newDriver] = await db('drivers').insert({
            full_name,
            phone,
            aadhar_number,
            pan_number,
            license_number,
            license_expiry,
            bank_name,
            bank_account_last4,
            assigned_truck_id,
            employment_status: employment_status || 'active',
            documents: JSON.stringify(documents || []),
            photo_url,
            post: post || 'Driver'
        }).returning('*');

        res.status(201).json(newDriver);
    } catch (error) {
        console.error('Error creating driver:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateDriver = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    if (updates.documents) {
        updates.documents = JSON.stringify(updates.documents);
    }

    try {
        const [updatedDriver] = await db('drivers')
            .where({ id })
            .update(updates)
            .returning('*');

        if (!updatedDriver) {
            return res.status(404).json({ error: 'Driver not found' });
        }
        res.json(updatedDriver);
    } catch (error) {
        console.error('Error updating driver:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteDriver = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCount = await db('drivers').where({ id }).del();
        if (deletedCount === 0) {
            return res.status(404).json({ error: 'Driver not found' });
        }
        res.json({ message: 'Driver deleted successfully' });
    } catch (error) {
        console.error('Error deleting driver:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllDrivers,
    getDriverById,
    createDriver,
    updateDriver,
    deleteDriver
};
