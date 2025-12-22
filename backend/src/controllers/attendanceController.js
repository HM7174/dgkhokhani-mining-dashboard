const db = require('../db/db');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const EXCEL_PATH = path.join(__dirname, '../../../DG KHOKHANI ATTENDANCE SHEET.xlsx');

const updateExcelAttendance = async (driverName, date, status) => {
    try {
        if (!fs.existsSync(EXCEL_PATH)) {
            console.error('Excel file not found at:', EXCEL_PATH);
            return;
        }

        const workbook = xlsx.readFile(EXCEL_PATH);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        const headerRow = rows[0];
        const dayRow = rows[1];
        const nameColIndex = headerRow.indexOf('NAME');

        if (nameColIndex === -1) {
            console.error('NAME column not found in Excel');
            return;
        }

        const parsedDate = new Date(date);
        const dayNum = parsedDate.getDate();
        const monthNum = parsedDate.getMonth();
        const yearNum = parsedDate.getFullYear();

        // Check if Excel month matches the request month (basic check)
        const monthHeader = headerRow.find(h => typeof h === 'string' && ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'].some(m => h.toLowerCase().includes(m)));
        if (monthHeader) {
            const parts = monthHeader.split(/[, ]+/);
            const monthName = parts[0].toLowerCase();
            const excelMonthIndex = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'].indexOf(monthName);
            // If month doesn't match, we might be writing to the wrong sheet or file, but for now we follow the user's template.
            if (excelMonthIndex !== monthNum) {
                console.warn(`Month mismatch: Excel has ${monthName}, requested ${date}`);
            }
        }

        // Find driver row
        let driverRowIndex = -1;
        for (let i = 2; i < rows.length; i++) {
            if (rows[i] && rows[i][nameColIndex] && String(rows[i][nameColIndex]).toLowerCase().trim() === driverName.toLowerCase().trim()) {
                driverRowIndex = i;
                break;
            }
        }

        if (driverRowIndex === -1) {
            console.warn(`Driver "${driverName}" not found in Excel sheet.`);
            return;
        }

        // Find day column
        let dayColIndex = -1;
        for (let j = 0; j < dayRow.length; j++) {
            if (parseInt(dayRow[j]) === dayNum) {
                dayColIndex = j;
                break;
            }
        }

        if (dayColIndex === -1) {
            console.error(`Day ${dayNum} column not found in Excel.`);
            return;
        }

        // Update cell
        const cellRef = xlsx.utils.encode_cell({ r: driverRowIndex, c: dayColIndex });
        worksheet[cellRef] = { t: 's', v: status === 'present' ? 'P' : 'A' };

        // Write back
        xlsx.writeFile(workbook, EXCEL_PATH);
        console.log(`Excel updated for ${driverName} on ${date}: ${status}`);
    } catch (error) {
        console.error('Error updating Excel:', error);
    }
};

const getAttendance = async (req, res) => {
    const { date, driver_id, include_all_drivers } = req.query;
    try {
        if (include_all_drivers === 'true' && date) {
            // Get all active drivers and their attendance for a specific date
            const drivers = await db('drivers')
                .where('employment_status', 'active')
                .select('id', 'full_name');

            const attendance = await db('attendance')
                .where('date', date)
                .select('*');

            const attendanceMap = {};
            attendance.forEach(a => {
                attendanceMap[a.driver_id] = a;
            });

            const result = drivers.map(d => ({
                id: d.id,
                full_name: d.full_name,
                status: attendanceMap[d.id]?.status || 'none', // none, present, absent
                notes: attendanceMap[d.id]?.notes || '',
                date: date
            }));

            return res.json(result);
        }

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

        // Sync with Excel
        const driver = await db('drivers').where('id', driver_id).first();
        if (driver) {
            await updateExcelAttendance(driver.full_name, date, status);
        }

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

                // Sync with Excel
                const driver = await trx('drivers').where('id', record.driver_id).first();
                if (driver) {
                    await updateExcelAttendance(driver.full_name, record.date, record.status);
                }
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
        const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        if (rows.length < 2) {
            return res.status(400).json({ error: 'Excel file is empty or invalid format' });
        }

        // Get all drivers to map names to IDs
        const drivers = await db('drivers').select('id', 'full_name');
        const driverMap = {};
        drivers.forEach(d => {
            driverMap[d.full_name.toLowerCase().trim()] = d.id;
        });

        const attendanceRecords = [];
        const errors = [];

        // Identify if it's the custom monthly grid format or standard format
        const headerRow = rows[0];
        const isMonthlyGrid = headerRow.includes('S.NO') && headerRow.includes('NAME') && headerRow.some(h => typeof h === 'string' && (h.toLowerCase().includes('january') || h.toLowerCase().includes('february') || h.toLowerCase().includes('march') || h.toLowerCase().includes('april') || h.toLowerCase().includes('may') || h.toLowerCase().includes('june') || h.toLowerCase().includes('july') || h.toLowerCase().includes('august') || h.toLowerCase().includes('september') || h.toLowerCase().includes('october') || h.toLowerCase().includes('november') || h.toLowerCase().includes('december')));

        if (isMonthlyGrid) {
            // Parse Monthly Grid Format
            const monthHeader = headerRow.find(h => typeof h === 'string' && ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'].some(m => h.toLowerCase().includes(m)));

            // Extract month and year from header (e.g., "November,2025")
            let month = 0;
            let year = new Date().getFullYear();
            if (monthHeader) {
                const parts = monthHeader.split(/[, ]+/);
                const monthName = parts[0].toLowerCase();
                const monthIndex = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'].indexOf(monthName);
                if (monthIndex !== -1) month = monthIndex;
                if (parts[1] && !isNaN(parts[1])) year = parseInt(parts[1]);
            }

            const dayRow = rows[1];
            const nameColIndex = headerRow.indexOf('NAME' || 'name');

            // Iterate through data rows (starting from row 2)
            for (let i = 2; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.length === 0) continue;

                const driverName = row[nameColIndex];
                if (!driverName || typeof driverName !== 'string' || ['OFFICE', 'SITE'].includes(driverName.toUpperCase())) continue;

                const driverId = driverMap[driverName.toLowerCase().trim()];
                if (!driverId) {
                    // Non-blocking error for individual driver mismatch
                    console.warn(`Driver "${driverName}" not found during import`);
                    continue;
                }

                // Iterate through columns to find day markers
                for (let j = 0; j < row.length; j++) {
                    const dayNum = parseInt(dayRow[j]);
                    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) continue;

                    const statusVal = row[j];
                    if (!statusVal) continue;

                    let status = null;
                    const statusStr = String(statusVal).trim().toUpperCase();
                    if (statusStr === 'P' || statusStr.includes('PRESENT')) status = 'present';
                    else if (statusStr === 'A' || statusStr.includes('ABSENT')) status = 'absent';

                    if (status) {
                        // month is 0-indexed, dayNum is 1-indexed
                        const date = new Date(year, month, dayNum).toISOString().split('T')[0];
                        attendanceRecords.push({
                            driver_id: driverId,
                            date: date,
                            status: status,
                            notes: ''
                        });
                    }
                }
            }
        } else {
            // Standard Format (from json conversion)
            const data = xlsx.utils.sheet_to_json(worksheet);
            data.forEach((row, index) => {
                const driverName = row['Driver Name'] || row['driver_name'] || row['Driver'] || row['Name'];
                const dateVal = row['Date'] || row['date'];
                const statusValue = row['Status'] || row['status'] || row['Attendance'];

                if (!driverName || !dateVal) return;

                let status = 'absent';
                if (statusValue) {
                    const statusStr = String(statusValue).trim().toUpperCase();
                    if (statusStr === 'P' || statusStr === 'PRESENT') status = 'present';
                    else if (statusStr === 'A' || statusStr === 'ABSENT') status = 'absent';
                }

                let parsedDate;
                if (typeof dateVal === 'number') {
                    const excelEpoch = new Date(1899, 11, 30);
                    parsedDate = new Date(excelEpoch.getTime() + dateVal * 86400000);
                } else {
                    parsedDate = new Date(dateVal);
                }

                if (isNaN(parsedDate.getTime())) return;
                const formattedDate = parsedDate.toISOString().split('T')[0];

                const driverId = driverMap[driverName.toLowerCase().trim()];
                if (driverId) {
                    attendanceRecords.push({
                        driver_id: driverId,
                        date: formattedDate,
                        status: status,
                        notes: ''
                    });
                }
            });
        }

        if (attendanceRecords.length === 0) {
            return res.status(400).json({ error: 'No valid attendance records found in file' });
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

const exportAttendance = async (req, res) => {
    try {
        if (!fs.existsSync(EXCEL_PATH)) {
            return res.status(404).json({ error: 'Attendance sheet not found' });
        }

        res.download(EXCEL_PATH, 'DG_KHOKHANI_ATTENDANCE.xlsx', (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                // Can't send JSON here if headers sent, but good for logging
            }
        });
    } catch (error) {
        console.error('Error exporting attendance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAttendance,
    markAttendance,
    bulkAttendance,
    importExcel,
    exportAttendance
};
