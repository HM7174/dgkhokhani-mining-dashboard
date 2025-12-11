const db = require('../db/db');

const getAllSites = async (req, res) => {
    try {
        const sites = await db('sites').select('*');
        res.json(sites);
    } catch (error) {
        console.error('Error fetching sites:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getSiteById = async (req, res) => {
    const { id } = req.params;
    try {
        const site = await db('sites').where({ id }).first();
        if (!site) {
            return res.status(404).json({ error: 'Site not found' });
        }

        // Get assigned trucks
        const trucks = await db('trucks').where({ site_id: id });
        site.trucks = trucks;

        res.json(site);
    } catch (error) {
        console.error('Error fetching site:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createSite = async (req, res) => {
    const { name, location_lat, location_lng, site_manager } = req.body;
    try {
        const [newSite] = await db('sites').insert({
            name, location_lat, location_lng, site_manager
        }).returning('*');
        res.status(201).json(newSite);
    } catch (error) {
        console.error('Error creating site:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateSite = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const [updatedSite] = await db('sites').where({ id }).update(updates).returning('*');
        if (!updatedSite) {
            return res.status(404).json({ error: 'Site not found' });
        }
        res.json(updatedSite);
    } catch (error) {
        console.error('Error updating site:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteSite = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCount = await db('sites').where({ id }).del();
        if (deletedCount === 0) {
            return res.status(404).json({ error: 'Site not found' });
        }
        res.json({ message: 'Site deleted successfully' });
    } catch (error) {
        console.error('Error deleting site:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllSites,
    getSiteById,
    createSite,
    updateSite,
    deleteSite
};
