const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex('audit_logs').del();
    await knex('attendance').del();
    await knex('fuel_logs').del();
    await knex('drivers').del();
    await knex('trucks').del();
    await knex('sites').del();
    await knex('users').del();

    // Create Users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const managerPassword = await bcrypt.hash('manager123', 10);

    const [admin] = await knex('users').insert([
        { username: 'admin', password_hash: adminPassword, role: 'admin' }
    ]).returning('id');

    const [manager] = await knex('users').insert([
        { username: 'site_mgr', password_hash: managerPassword, role: 'site_manager' }
    ]).returning('id');

    // Create Sites
    const [siteA] = await knex('sites').insert([
        { name: 'North Mine Site', location_lat: 23.456, location_lng: 85.123, site_manager: 'John Doe' }
    ]).returning('id');

    const [siteB] = await knex('sites').insert([
        { name: 'South Quarry', location_lat: 23.789, location_lng: 85.456, site_manager: 'Jane Smith' }
    ]).returning('id');

    // Create Trucks
    const [truck1] = await knex('trucks').insert([
        { name: 'T-101', type: 'truck', registration_number: 'JH-01-AB-1234', site_id: siteA.id, status: 'active', total_km: 15000, avg_km_per_litre: 3.5 }
    ]).returning('id');

    const [excavator1] = await knex('trucks').insert([
        { name: 'EX-201', type: 'machine', registration_number: 'JH-01-XY-9876', site_id: siteB.id, status: 'active', total_km: 5000, avg_km_per_litre: 12.0 } // machines might use litres per hour, but using same field for now
    ]).returning('id');

    // Create Drivers
    const [driver1] = await knex('drivers').insert([
        { full_name: 'Ramesh Kumar', phone: '9876543210', assigned_truck_id: truck1.id, employment_status: 'active' }
    ]).returning('id');

    const [driver2] = await knex('drivers').insert([
        { full_name: 'Suresh Singh', phone: '9123456780', assigned_truck_id: excavator1.id, employment_status: 'active' }
    ]).returning('id');

    // Create Fuel Logs
    await knex('fuel_logs').insert([
        { truck_id: truck1.id, site_id: siteA.id, date: new Date(), litres: 50, price_per_litre: 95.5, vendor: 'Indian Oil', odometer_reading: 15050 }
    ]);

    // Create Attendance
    await knex('attendance').insert([
        { driver_id: driver1.id, date: new Date(), in_time: '08:00:00', out_time: '17:00:00', status: 'present' }
    ]);

    console.log('Seed data inserted successfully');
};
