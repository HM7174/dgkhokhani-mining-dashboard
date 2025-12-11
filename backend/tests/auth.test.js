const request = require('supertest');
const app = require('../src/app'); // You might need to export app from server.js or app.js
const db = require('../src/db/db');

describe('Auth Endpoints', () => {
    it('should return 401 for protected route without token', async () => {
        const res = await request(app)
            .get('/api/trucks');
        expect(res.statusCode).toEqual(401);
    });

    // Add more tests here
});

afterAll(async () => {
    await db.destroy();
});
