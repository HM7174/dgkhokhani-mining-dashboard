import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2 } from 'lucide-react';

const FuelPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        truck_id: '', site_id: '', date: new Date().toISOString().split('T')[0], litres: '', price_per_litre: '', vendor: '', odometer_reading: ''
    });
    const [editingLog, setEditingLog] = useState(null);
    const [trucks, setTrucks] = useState([]);
    const [sites, setSites] = useState([]);

    useEffect(() => {
        fetchLogs();
        fetchTrucks();
        fetchSites();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await api.get('/fuel');
            setLogs(response.data);
        } catch (error) {
            console.error('Error fetching fuel logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrucks = async () => {
        try {
            const response = await api.get('/trucks');
            setTrucks(response.data);
        } catch (error) {
            console.error('Error fetching trucks:', error);
        }
    };

    const fetchSites = async () => {
        try {
            const response = await api.get('/sites');
            setSites(response.data);
        } catch (error) {
            console.error('Error fetching sites:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLog) {
                await api.put(`/fuel/${editingLog.id}`, formData);
            } else {
                await api.post('/fuel', formData);
            }
            setIsModalOpen(false);
            setEditingLog(null);
            fetchLogs();
            setFormData({
                truck_id: '', site_id: '', date: new Date().toISOString().split('T')[0], litres: '', price_per_litre: '', vendor: '', odometer_reading: ''
            });
        } catch (error) {
            console.error('Error saving fuel log:', error);
            alert('Failed to save fuel log');
        }
    };

    const handleEdit = (log) => {
        setEditingLog(log);
        setFormData({
            truck_id: log.truck_id,
            site_id: log.site_id,
            date: new Date(log.date).toISOString().split('T')[0],
            litres: log.litres,
            price_per_litre: log.price_per_litre,
            vendor: log.vendor,
            odometer_reading: log.odometer_reading
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this fuel log?')) {
            try {
                await api.delete(`/fuel/${id}`);
                fetchLogs();
            } catch (error) {
                console.error('Error deleting fuel log:', error);
                alert('Failed to delete fuel log');
            }
        }
    };

    const columns = [
        { header: 'Date', accessor: 'date', render: (row) => new Date(row.date).toLocaleDateString() },
        { header: 'Vehicle', accessor: 'truck_name' },
        { header: 'Site', accessor: 'site_name' },
        { header: 'Litres', accessor: 'litres' },
        { header: 'Cost', accessor: 'cost', render: (row) => row.price_per_litre ? `₹${(row.litres * row.price_per_litre).toFixed(2)}` : '-' },
        { header: 'Odometer', accessor: 'odometer_reading' },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-800">
                        <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Fuel Logs</h1>
                <button
                    onClick={() => {
                        setEditingLog(null);
                        setFormData({
                            truck_id: '', site_id: '', date: new Date().toISOString().split('T')[0], litres: '', price_per_litre: '', vendor: '', odometer_reading: ''
                        });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Fuel Entry</span>
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <Table columns={columns} data={logs} />
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLog ? "Edit Fuel Entry" : "Add Fuel Entry"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                            <input
                                type="date"
                                required
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle</label>
                            <select
                                required
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                value={formData.truck_id}
                                onChange={(e) => setFormData({ ...formData, truck_id: e.target.value })}
                            >
                                <option value="">Select Vehicle</option>
                                {trucks.map(truck => (
                                    <option key={truck.id} value={truck.id}>{truck.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Site</label>
                            <select
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                value={formData.site_id}
                                onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                            >
                                <option value="">Select Site</option>
                                {sites.map(site => (
                                    <option key={site.id} value={site.id}>{site.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Litres</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                value={formData.litres}
                                onChange={(e) => setFormData({ ...formData, litres: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price / Litre</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                value={formData.price_per_litre}
                                onChange={(e) => setFormData({ ...formData, price_per_litre: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Odometer</label>
                            <input
                                type="number"
                                step="0.1"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                value={formData.odometer_reading}
                                onChange={(e) => setFormData({ ...formData, odometer_reading: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
                        <input
                            type="text"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.vendor}
                            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                        >
                            {editingLog ? 'Update Entry' : 'Add Entry'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default FuelPage;
