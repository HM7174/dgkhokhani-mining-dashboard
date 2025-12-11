/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Users
    await knex.schema.createTable('users', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.string('username', 50).unique().notNullable();
        table.string('password_hash', 255).notNullable();
        table.string('role', 20).notNullable(); // admin, site_manager, dispatch, account
        table.jsonb('permissions').defaultTo('{}');
        table.timestamp('last_login');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });

    // Sites
    await knex.schema.createTable('sites', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.string('name', 100).notNullable();
        table.float('location_lat');
        table.float('location_lng');
        table.string('site_manager', 100);
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });

    // Trucks
    await knex.schema.createTable('trucks', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.string('name', 100).notNullable();
        table.string('type', 20).notNullable(); // truck, machine
        table.string('registration_number', 50).unique();
        table.date('puc_expiry');
        table.date('insurance_expiry');
        table.string('insurance_provider', 100);
        table.string('gps_device_id', 100);
        table.float('total_km').defaultTo(0);
        table.float('avg_km_per_litre').defaultTo(0);
        table.string('status', 20).defaultTo('active'); // active, in-repair
        table.uuid('site_id').references('id').inTable('sites').onDelete('SET NULL');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });

    // Drivers
    await knex.schema.createTable('drivers', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.string('full_name', 100).notNullable();
        table.string('phone', 20);
        table.string('aadhar_number', 20);
        table.string('pan_number', 20);
        table.string('license_number', 50);
        table.date('license_expiry');
        table.string('bank_name', 100);
        table.string('bank_account_last4', 4);
        table.uuid('assigned_truck_id').references('id').inTable('trucks').onDelete('SET NULL');
        table.string('employment_status', 20).defaultTo('active');
        table.jsonb('documents').defaultTo('[]');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });

    // Fuel Logs
    await knex.schema.createTable('fuel_logs', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('truck_id').references('id').inTable('trucks').onDelete('CASCADE');
        table.uuid('site_id').references('id').inTable('sites').onDelete('SET NULL');
        table.date('date').notNullable();
        table.float('litres').notNullable();
        table.float('price_per_litre');
        table.string('vendor', 100);
        table.float('odometer_reading');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });

    // Attendance
    await knex.schema.createTable('attendance', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('driver_id').references('id').inTable('drivers').onDelete('CASCADE');
        table.date('date').notNullable();
        table.time('in_time');
        table.time('out_time');
        table.string('status', 20).notNullable(); // present, absent
        table.text('notes');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.unique(['driver_id', 'date']);
    });

    // Audit Logs
    await knex.schema.createTable('audit_logs', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
        table.string('action', 100).notNullable();
        table.jsonb('details');
        table.timestamp('timestamp').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('audit_logs');
    await knex.schema.dropTableIfExists('attendance');
    await knex.schema.dropTableIfExists('fuel_logs');
    await knex.schema.dropTableIfExists('drivers');
    await knex.schema.dropTableIfExists('trucks');
    await knex.schema.dropTableIfExists('sites');
    await knex.schema.dropTableIfExists('users');
};
