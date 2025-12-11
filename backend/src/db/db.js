const knex = require('knex');
const knexFile = require('../../knexfile');

const environment = process.env.NODE_ENV || 'development';
const config = knexFile[environment];

module.exports = knex(config);
