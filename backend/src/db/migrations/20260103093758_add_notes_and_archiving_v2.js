/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Add notes and archiving to trucks
    await knex.schema.alterTable('trucks', (table) => {
        table.text('notes');
        table.boolean('is_archived').defaultTo(false);
    });

    // Add archiving to sites
    await knex.schema.alterTable('sites', (table) => {
        table.boolean('is_archived').defaultTo(false);
    });

    // Create expenses table
    await knex.schema.createTable('truck_expenses', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('truck_id').references('id').inTable('trucks').onDelete('CASCADE').notNullable();
        table.string('description', 255).notNullable();
        table.float('amount').notNullable();
        table.date('date').notNullable();
        table.string('category', 50);
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('truck_expenses');
    await knex.schema.alterTable('sites', (table) => {
        table.dropColumn('is_archived');
    });
    await knex.schema.alterTable('trucks', (table) => {
        table.dropColumn('is_archived');
        table.dropColumn('notes');
    });
};
