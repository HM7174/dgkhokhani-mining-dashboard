const db = require('../db/db');

const getAttendance = async (req, res) => {
    const { date, driver_id } = req.query;
    try {
        let query = db('attendance')
            .leftJoin('drivers', 'attendance.driver_id', 'drivers.id')
            .select('attendance.*', 'drivers.full_name');

        if (date) query = query.where('attendance.date', date);
        if (driver_id) query = query.where('attendance.driver_id', driver_id);

        const records = await query.orderBy('attendance.date', 'desc');
        res.json(records);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const markAttendance = async (req, res) => {
    const { driver_id, date, in_time, out_time, status, notes } = req.body;
    try {
        const [record] = await db('attendance').insert({
            driver_id, date, in_time, out_time, status, notes
        })
            .onConflict(['driver_id', 'date'])
            .merge() // Update if exists
            .returning('*');

        res.json(record);
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const bulkAttendance = async (req, res) => {
    const { records } = req.body; // Array of attendance objects
    if (!Array.isArray(records)) {
        return res.status(400).json({ error: 'Invalid data format' });
    }

    try {
        await db.transaction(async trx => {
            for (const record of records) {
                await trx('attendance').insert(record)
                    .onConflict(['driver_id', 'date'])
                    .merge();
            }
        });
        res.json({ message: 'Bulk attendance uploaded successfully' });
    } catch (error) {
        console.error('Error bulk attendance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAttendance,
    markAttendance,
    bulkAttendance
};
