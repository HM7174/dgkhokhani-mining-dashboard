const db = require('../db/db');

const getFuelLogs = async (req, res) => {
    const { truck_id, site_id, start_date, end_date } = req.query;
    try {
        let query = db('fuel_logs')
            .leftJoin('trucks', 'fuel_logs.truck_id', 'trucks.id')
            .leftJoin('sites', 'fuel_logs.site_id', 'sites.id')
            .select(
                'fuel_logs.*',
                'trucks.name as truck_name',
                'sites.name as site_name'
            );

        if (truck_id) query = query.where('fuel_logs.truck_id', truck_id);
        if (site_id) query = query.where('fuel_logs.site_id', site_id);
        if (start_date) query = query.where('fuel_logs.date', '>=', start_date);
        if (end_date) query = query.where('fuel_logs.date', '<=', end_date);

        const logs = await query.orderBy('fuel_logs.date', 'desc');
        res.json(logs);
    } catch (error) {
        console.error('Error fetching fuel logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const addFuelLog = async (req, res) => {
    const { truck_id, site_id, date, litres, price_per_litre, vendor, odometer_reading } = req.body;
    try {
        const [newLog] = await db('fuel_logs').insert({
            truck_id, site_id, date, litres, price_per_litre, vendor, odometer_reading
        }).returning('*');

        // Update truck stats
        // This is a simplified calculation. In a real app, we'd need more complex logic for avg km/l based on previous reading.
        // For now, just updating total_km if odometer is provided
        if (odometer_reading) {
            // Find previous reading to calc distance
            // This logic can be complex, skipping for now to keep it simple as requested
            // Just updating the truck's total_km to the new odometer reading if it's higher
            const truck = await db('trucks').where({ id: truck_id }).first();
            if (truck && odometer_reading > truck.total_km) {
                await db('trucks').where({ id: truck_id }).update({ total_km: odometer_reading });
            }
        }

        res.status(201).json(newLog);
    } catch (error) {
        console.error('Error adding fuel log:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getFuelStats = async (req, res) => {
    try {
        const totalConsumption = await db('fuel_logs').sum('litres as total_litres');
        const totalCost = await db('fuel_logs').select(db.raw('SUM(litres * price_per_litre) as total_cost'));

        res.json({
            total_litres: totalConsumption[0].total_litres || 0,
            total_cost: totalCost[0].total_cost || 0
        });
    } catch (error) {
        console.error('Error fetching fuel stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getFuelLogs,
    addFuelLog,
    getFuelStats
};
