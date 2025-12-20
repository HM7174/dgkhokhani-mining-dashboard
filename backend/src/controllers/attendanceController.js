const db = require('../db/db');
const xlsx = require('xlsx');

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
    const { driver_id, date, status, notes } = req.body;
    try {
        const [record] = await db('attendance').insert({
            driver_id, date, status, notes
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

const importExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Get all drivers to map names to IDs
        const drivers = await db('drivers').select('id', 'full_name');
        const driverMap = {};
        drivers.forEach(d => {
            driverMap[d.full_name.toLowerCase().trim()] = d.id;
        });

        const attendanceRecords = [];
        const errors = [];

        data.forEach((row, index) => {
            // Expected columns: Date, Driver Name, Status (P/A)
            const driverName = row['Driver Name'] || row['driver_name'] || row['Driver'] || row['Name'];
            const date = row['Date'] || row['date'];
            const statusValue = row['Status'] || row['status'] || row['Attendance'];

            if (!driverName || !date) {
                errors.push(`Row ${index + 2}: Missing driver name or date`);
                return;
            }

            // Parse status: P -> present, A -> absent
            let status = 'absent';
            if (statusValue) {
                const statusStr = String(statusValue).trim().toUpperCase();
                if (statusStr === 'P' || statusStr === 'PRESENT') {
                    status = 'present';
                } else if (statusStr === 'A' || statusStr === 'ABSENT') {
                    status = 'absent';
                }
            }

            // Parse date
            let parsedDate;
            if (typeof date === 'number') {
                // Excel serial date
                const excelEpoch = new Date(1899, 11, 30);
                parsedDate = new Date(excelEpoch.getTime() + date * 86400000);
            } else {
                parsedDate = new Date(date);
            }

            if (isNaN(parsedDate.getTime())) {
                errors.push(`Row ${index + 2}: Invalid date format`);
                return;
            }

            const formattedDate = parsedDate.toISOString().split('T')[0];

            // Find driver ID
            const driverId = driverMap[driverName.toLowerCase().trim()];
            if (!driverId) {
                errors.push(`Row ${index + 2}: Driver "${driverName}" not found`);
                return;
            }

            attendanceRecords.push({
                driver_id: driverId,
                date: formattedDate,
                status: status,
                notes: ''
            });
        });

        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Import failed with errors',
                errors: errors,
                successCount: attendanceRecords.length
            });
        }

        // Insert records
        await db.transaction(async trx => {
            for (const record of attendanceRecords) {
                await trx('attendance').insert(record)
                    .onConflict(['driver_id', 'date'])
                    .merge();
            }
        });

        res.json({
            message: 'Attendance imported successfully',
            count: attendanceRecords.length
        });
    } catch (error) {
        console.error('Error importing excel:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAttendance,
    markAttendance,
    bulkAttendance,
    importExcel
};
