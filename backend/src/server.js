const app = require('./app');
const db = require('./db/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Check DB connection
        await db.raw('SELECT 1');
        console.log('Database connected successfully');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    }
}

startServer();
