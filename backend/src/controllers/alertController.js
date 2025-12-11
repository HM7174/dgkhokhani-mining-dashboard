const db = require('../db/db');

const getAlerts = async (req, res) => {
    try {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const alerts = [];

        // Check Trucks Insurance
        const expiringInsurance = await db('trucks')
            .where('insurance_expiry', '<=', thirtyDaysFromNow)
            .andWhere('status', 'active');

        expiringInsurance.forEach(truck => {
            alerts.push({
                type: 'warning',
                message: `Insurance for ${truck.name} expires on ${new Date(truck.insurance_expiry).toLocaleDateString()}`,
                entity: 'Truck',
                id: truck.id
            });
        });

        // Check Trucks PUC
        const expiringPUC = await db('trucks')
            .where('puc_expiry', '<=', thirtyDaysFromNow)
            .andWhere('status', 'active');

        expiringPUC.forEach(truck => {
            alerts.push({
                type: 'warning',
                message: `PUC for ${truck.name} expires on ${new Date(truck.puc_expiry).toLocaleDateString()}`,
                entity: 'Truck',
                id: truck.id
            });
        });

        // Check Drivers License
        const expiringLicense = await db('drivers')
            .where('license_expiry', '<=', thirtyDaysFromNow)
            .andWhere('employment_status', 'active');

        expiringLicense.forEach(driver => {
            alerts.push({
                type: 'warning',
                message: `License for ${driver.full_name} expires on ${new Date(driver.license_expiry).toLocaleDateString()}`,
                entity: 'Driver',
                id: driver.id
            });
        });

        res.json(alerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAlerts
};
