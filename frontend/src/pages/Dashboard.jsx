import React from 'react';
import { Truck, Activity, Droplets, Users, AlertTriangle } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import api from '../services/api';

const KPICard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
        {subtext && <p className="text-xs text-slate-400 mt-4">{subtext}</p>}
    </div>
);

const Dashboard = () => {
    // Mock data for now - will connect to API later
    const stats = [
        { title: 'Total Trucks', value: '24', icon: Truck, color: 'bg-blue-500', subtext: '4 In Repair' },
        { title: 'Active Drivers', value: '18', icon: Users, color: 'bg-green-500', subtext: 'On duty today' },
        { title: 'Fuel Consumed', value: '1,240 L', icon: Droplets, color: 'bg-amber-500', subtext: 'This Month' },
        { title: 'Avg Efficiency', value: '3.2 km/L', icon: Activity, color: 'bg-purple-500', subtext: 'Fleet Average' },
    ];

    const [alerts, setAlerts] = React.useState([]);

    React.useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await api.get('/alerts');
                setAlerts(response.data);
            } catch (error) {
                console.error('Error fetching alerts:', error);
            }
        };
        fetchAlerts();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <KPICard key={index} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Live Fleet Map</h2>
                    <div className="w-full h-full bg-slate-100 rounded-lg overflow-hidden relative z-0">
                        <MapComponent />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 overflow-y-auto max-h-96">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Alerts</h2>
                    <div className="space-y-4">
                        {alerts.length === 0 ? (
                            <p className="text-sm text-slate-400">No active alerts</p>
                        ) : (
                            alerts.map((alert, i) => (
                                <div key={i} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                                    <AlertTriangle size={18} className="text-red-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-red-800">{alert.entity} Alert</p>
                                        <p className="text-xs text-red-600">{alert.message}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
