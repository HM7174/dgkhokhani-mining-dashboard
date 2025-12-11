# D.G.Khokhani Dashboard

A comprehensive web-based dashboard for managing mining operations, including fleet management (trucks/machines), drivers, sites, fuel logs, and attendance.

## Features

- **Dashboard**: Real-time overview with KPI cards and interactive map.
- **Fleet Management**: Track trucks and machines, including status, insurance, and PUC expiry.
- **Driver Management**: Manage driver profiles and assignments.
- **Site Management**: Manage mining sites and assign resources.
- **Fuel Logs**: Track diesel consumption and costs.
- **Attendance**: Mark daily attendance for drivers and export to Excel.
- **Alerts**: Automated notifications for expiring documents.
- **Audit Logs**: Track user actions for security and accountability.
- **Role-Based Access**: Admin, Site Manager, Dispatch, and Account roles.

## Tech Stack

- **Frontend**: React, Tailwind CSS, Leaflet (Maps), Recharts.
- **Backend**: Node.js, Express, Knex.js.
- **Database**: PostgreSQL.
- **Authentication**: JWT.

## Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

## Setup Instructions

### 1. Database Setup

Create a PostgreSQL database:
```sql
CREATE DATABASE mining_dashboard;
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Configure environment variables:
Copy `.env.example` to `.env` and update the database credentials.
```bash
cp .env.example .env
```

Run migrations and seed data:
```bash
npx knex migrate:latest
npx knex seed:run
```

Start the server:
```bash
npm start
```
The backend will run on `http://localhost:3000`.

### 3. Frontend Setup

Navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`.

## Default Credentials

- **Admin**: `admin` / `admin123`
- **Site Manager**: `site_mgr` / `manager123`

## Deployment

### Free Hosting on Render

This application can be deployed for **FREE** on Render. See the [Deployment Guide](./DEPLOYMENT_GUIDE.md) for detailed step-by-step instructions.

**Quick Start**:
1. Push your code to GitHub
2. Connect your GitHub repo to Render
3. Deploy using the included `render.yaml` blueprint

The free tier includes:
- PostgreSQL database
- Backend API hosting
- Frontend static site hosting
- Free SSL certificates
- Auto-deploy from GitHub

### Docker

Build and run using Docker Compose:
```bash
docker-compose up --build
```


## API Documentation

See `design_spec.md` for detailed API endpoints and schema.
