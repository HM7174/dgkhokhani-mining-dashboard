import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Archive as ArchiveIcon, RefreshCcw, MapPin, Truck, Calendar, Trash2 } from 'lucide-react';

const Archive = () => {
    const [archivedSites, setArchivedSites] = useState([]);
    const [archivedTrucks, setArchivedTrucks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sites');

    useEffect(() => {
        fetchArchiveData();
    }, []);

    const fetchArchiveData = async () => {
        setLoading(true);
        try {
            const [sitesRes, trucksRes] = await Promise.all([
                api.get('/sites?include_archived=true'),
                api.get('/trucks?include_archived=true')
            ]);

            setArchivedSites(sitesRes.data.filter(s => s.is_archived));
            setArchivedTrucks(trucksRes.data.filter(t => t.is_archived));
        } catch (error) {
            console.error('Error fetching archive data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreSite = async (id) => {
        if (!window.confirm('Restore this site to active list?')) return;
        try {
            await api.post(`/sites/${id}/restore`);
            fetchArchiveData();
            alert('Site restored successfully');
        } catch (error) {
            console.error('Error restoring site:', error);
            alert('Failed to restore site');
        }
    };

    const handleRestoreTruck = async (id) => {
        if (!window.confirm('Restore this vehicle to active list?')) return;
        try {
            await api.post(`/trucks/${id}/restore`);
            fetchArchiveData();
            alert('Vehicle restored successfully');
        } catch (error) {
            console.error('Error restoring truck:', error);
            alert('Failed to restore vehicle');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 italic">Accessing archive records...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <ArchiveIcon className="text-blue-500" />
                        Completed Sites & Archive
                    </h1>
                    <p className="text-sm text-slate-500">Manage your historical data and completed projects</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-200 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('sites')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'sites' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                        }`}
                >
                    Completed Sites ({archivedSites.length})
                </button>
                <button
                    onClick={() => setActiveTab('trucks')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'trucks' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                        }`}
                >
                    Archived Vehicles ({archivedTrucks.length})
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {activeTab === 'sites' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Site Name</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Manager</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Coordinates</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {archivedSites.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">No completed sites found</td>
                                    </tr>
                                ) : (
                                    archivedSites.map((site) => (
                                        <tr key={site.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 mr-3">
                                                        <MapPin size={20} />
                                                    </div>
                                                    <span className="font-bold text-slate-800 uppercase">{site.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 italic">{site.site_manager || 'N/A'}</td>
                                            <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                                {site.location_lat}, {site.location_lng}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleRestoreSite(site.id)}
                                                    className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    <RefreshCcw size={14} />
                                                    <span>RESTORE</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vehicle</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reg. Number</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {archivedTrucks.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">No archived vehicles found</td>
                                    </tr>
                                ) : (
                                    archivedTrucks.map((truck) => (
                                        <tr key={truck.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 mr-3">
                                                        <Truck size={20} />
                                                    </div>
                                                    <span className="font-bold text-slate-800 uppercase">{truck.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 uppercase text-xs font-bold text-slate-500 tracking-tighter">{truck.type}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-yellow-100 border border-yellow-200 text-slate-800 font-mono font-bold px-2 py-1 rounded text-xs">
                                                    {truck.registration_number}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleRestoreTruck(truck.id)}
                                                    className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    <RefreshCcw size={14} />
                                                    <span>RESTORE</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Archive;
