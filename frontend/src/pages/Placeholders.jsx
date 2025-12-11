import React from 'react';

const PlaceholderPage = ({ title }) => (
    <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-4">{title}</h1>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center text-slate-500">
            <p>This module is under construction.</p>
        </div>
    </div>
);

export const TrucksPage = () => <PlaceholderPage title="Trucks & Machines" />;
export const DriversPage = () => <PlaceholderPage title="Drivers Management" />;
export const SitesPage = () => <PlaceholderPage title="Sites Management" />;
export const FuelPage = () => <PlaceholderPage title="Fuel Logs" />;
export const AttendancePage = () => <PlaceholderPage title="Attendance" />;
