const db = require('../db/db');

const getAllSites = async (req, res) => {
    const { include_archived } = req.query;
    try {
        let query = db('sites')
            .leftJoin('trucks', 'sites.id', 'trucks.site_id')
            .select('sites.*')
            .count('trucks.id as vehicle_count')
            .groupBy('sites.id');

        if (include_archived !== 'true') {
            query = query.where('sites.is_archived', false);
        }

        const sites = await query;
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

        // Get assigned trucks (only active ones)
        const trucks = await db('trucks').where({ site_id: id, is_archived: false });
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
            name, location_lat, location_lng, site_manager,
            is_archived: false
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
        // Soft delete: mark as archived
        const updatedCount = await db('sites')
            .where({ id })
            .update({ is_archived: true });

        if (updatedCount === 0) {
            return res.status(404).json({ error: 'Site not found' });
        }

        // Also unassign trucks from this site
        await db('trucks').where({ site_id: id }).update({ site_id: null });

        res.json({ message: 'Site archived successfully' });
    } catch (error) {
        console.error('Error archiving site:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const restoreSite = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedCount = await db('sites')
            .where({ id })
            .update({ is_archived: false });

        if (updatedCount === 0) {
            return res.status(404).json({ error: 'Site not found' });
        }
        res.json({ message: 'Site restored successfully' });
    } catch (error) {
        console.error('Error restoring site:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllSites,
    getSiteById,
    createSite,
    updateSite,
    deleteSite,
    restoreSite
};
