const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
// CORS configuration
// CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigin = process.env.FRONTEND_URL;

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check against allowed origin
        // 1. Exact match
        if (allowedOrigin && origin === allowedOrigin) return callback(null, true);

        // 2. Match if allowedOrigin is missing protocol (e.g. domain.com vs https://domain.com)
        if (allowedOrigin && !allowedOrigin.startsWith('http')) {
            if (origin === `https://${allowedOrigin}` || origin === `http://${allowedOrigin}`) {
                return callback(null, true);
            }
        }

        // 3. Match if allowedOrigin has protocol but origin differs (rare, but good for robustness)
        // e.g. allowed: https://site.com, origin: http://site.com

        // 4. Localhost allowed for development
        if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
            return callback(null, true);
        }

        // If we want to be permissive during debugging (optional, commented out for security)
        // return callback(null, true);

        console.log('Blocked by CORS:', origin); // helpful for server logs
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const truckRoutes = require('./routes/truckRoutes');
const driverRoutes = require('./routes/driverRoutes');
const siteRoutes = require('./routes/siteRoutes');
const fuelRoutes = require('./routes/fuelRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const alertRoutes = require('./routes/alertRoutes');
const auditRoutes = require('./routes/auditRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path');

app.use('/api/auth', authRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
    res.json({ message: 'D.G.Khokhani API is running' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
