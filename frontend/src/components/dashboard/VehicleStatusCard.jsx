import React from 'react';
import { Truck, Navigation, Square, Shield, UserMinus, WifiOff } from 'lucide-react';

const StatusItem = ({ icon: Icon, label, value, color, iconBg }) => (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${iconBg}`}>
                <Icon size={20} className={color} />
            </div>
            <span className="text-sm font-medium text-slate-600">{label}</span>
        </div>
        <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
);

const VehicleStatusCard = ({ statistics }) => {
    const statuses = [
        { label: 'Moving', value: statistics?.moving_vehicles || 0, icon: Navigation, color: 'text-green-600', iconBg: 'bg-green-50' },
        { label: 'Idling', value: statistics?.idle_vehicles || 0, icon: Truck, color: 'text-amber-600', iconBg: 'bg-amber-50' },
        { label: 'Stopped', value: statistics?.stopped_vehicles || 0, icon: Square, color: 'text-purple-600', iconBg: 'bg-purple-50' },
        { label: 'Geofence', value: 0, icon: Shield, color: 'text-blue-600', iconBg: 'bg-blue-50' },
        { label: 'Unsubscribed', value: 0, icon: UserMinus, color: 'text-rose-600', iconBg: 'bg-rose-50' },
        { label: 'Offline', value: 5, icon: WifiOff, color: 'text-slate-400', iconBg: 'bg-slate-50' },
    ];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Vehicle Status</h2>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View more</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {statuses.map((status, index) => (
                    <StatusItem key={index} {...status} />
                ))}
            </div>
        </div>
    );
};

export default VehicleStatusCard;
