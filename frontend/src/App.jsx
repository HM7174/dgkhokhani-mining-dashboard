import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './layouts/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TrucksPage from './pages/Trucks';
import TruckDetails from './pages/TruckDetails';
import DriversPage from './pages/Drivers';
import DriverDetails from './pages/DriverDetails';
import SitesPage from './pages/Sites';
import FuelPage from './pages/Fuel';
import AttendancePage from './pages/Attendance';
import AuditLogsPage from './pages/AuditLogs';
import UsersPage from './pages/Users';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/trucks" element={<TrucksPage />} />
                            <Route path="/trucks/:id" element={<TruckDetails />} />
                            <Route path="/drivers" element={<DriversPage />} />
                            <Route path="/drivers/:id" element={<DriverDetails />} />
                            <Route path="/sites" element={<SitesPage />} />
                            <Route path="/fuel" element={<FuelPage />} />
                            <Route path="/attendance" element={<AttendancePage />} />
                            <Route path="/users" element={<UsersPage />} />
                            <Route path="/audit" element={<AuditLogsPage />} />
                        </Route>
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
