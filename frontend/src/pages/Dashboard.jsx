import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Activity, Droplets, Users, RefreshCw, Gauge, HelpCircle, Bell, AlertTriangle, Monitor, Power, Edit3, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import MapComponent from '../components/MapComponent';
import fleetService from '../services/fleetService';

// New Dashboard Components
import VehicleStatusCard from '../components/dashboard/VehicleStatusCard';
import TodayPerformanceCard from '../components/dashboard/TodayPerformanceCard';
import EngineModeChart from '../components/dashboard/EngineModeChart';
import ServiceStatusChart from '../components/dashboard/ServiceStatusChart';
import FaultAlertsTable from '../components/dashboard/FaultAlertsTable';
import SubscriptionDetails from '../components/dashboard/SubscriptionDetails';

const Dashboard = () => {
    const [statistics, setStatistics] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [liveLocations, setLiveLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch all dashboard data
    const fetchDashboardData = useCallback(async (showRefreshing = false) => {
        if (showRefreshing) setIsRefreshing(true);

        try {
            // Fetch all data in parallel
            const [statsData, alertsData, locationsData] = await Promise.all([
                fleetService.getStatistics(),
                fleetService.getAlerts(),
                fleetService.getLiveLocations()
            ]);

            setStatistics(statsData);
            setAlerts(alertsData);
            setLiveLocations(locationsData);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Auto-refresh every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchDashboardData(true);
        }, 60000);

        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    const handleRefresh = () => {
        fetchDashboardData(true);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
            {/* Top Bar / Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <nav className="flex items-center gap-6">
                        <button className="text-sm font-bold border-b-2 border-blue-600 pb-1 text-slate-900 uppercase tracking-wider">Dashboard</button>
                        <button className="text-sm font-bold text-slate-400 pb-1 hover:text-slate-600 uppercase tracking-wider">Compare</button>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors">
                        <HelpCircle size={20} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors">
                        <Bell size={20} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors">
                        <AlertTriangle size={20} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors">
                        <Monitor size={20} />
                    </button>
                    <div className="h-6 w-px bg-slate-200 mx-2" />
                    <div className="flex items-center gap-2 pr-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                            DK
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 uppercase">DG Khokhani</span>
                        </div>
                    </div>
                    <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                        <Power size={20} />
                    </button>
                </div>
            </div>

            {/* Dashboard Controls */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <p className="text-xs italic text-slate-500 mb-1">
                        Disclaimer: <br />
                        1. Data is calculated for the last 24 hours or from midnight, as applicable.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-6 py-2 bg-[#E9F0FF] text-[#1E4DFF] rounded-xl font-bold text-sm hover:bg-[#D4E2FF] transition-colors"
                    >
                        <Share2 size={16} />
                        Generate Inshorts
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2 bg-[#1E293B] text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">
                        <Edit3 size={16} />
                        Edit Dashboard
                    </button>
                </div>
            </div>

            {/* Main Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <VehicleStatusCard statistics={statistics} />
                <TodayPerformanceCard statistics={statistics} />
                <EngineModeChart />
            </div>

            {/* Middle Row: Service Status and Fault Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <ServiceStatusChart />
                </div>
                <div className="lg:col-span-2">
                    <FaultAlertsTable />
                </div>
                <div className="lg:col-span-1">
                    <SubscriptionDetails />
                </div>
            </div>

            {/* Footer / Rate Limit Info */}
            <div className="flex items-center justify-between pt-4 text-xs text-slate-400 border-t border-slate-100">
                <div className="flex items-center gap-4">
                    <span>🔒 API Rate Limit: 60 requests/hour</span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 font-medium text-green-600">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Live tracking active
                    </span>
                </div>
                {lastUpdated && (
                    <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                )}
            </div>
        </div>
    );
};

export default Dashboard;


