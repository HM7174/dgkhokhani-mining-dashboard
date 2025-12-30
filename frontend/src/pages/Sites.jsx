import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Table from '../components/Table';
import Modal from '../components/Modal';

import { Plus, Edit, Trash2, Search, MapPin, Loader2 } from 'lucide-react';

const SitesPage = () => {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '', site_manager: '', location_lat: '', location_lng: ''
    });
    const [editingSite, setEditingSite] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        fetchSites();
    }, []);

    const fetchSites = async () => {
        try {
            const response = await api.get('/sites');
            setSites(response.data);
        } catch (error) {
            console.error('Error fetching sites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`);
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error('Error searching location:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectLocation = (location) => {
        setFormData({
            ...formData,
            name: formData.name || location.display_name.split(',')[0],
            location_lat: parseFloat(location.lat).toFixed(6),
            location_lng: parseFloat(location.lon).toFixed(6)
        });
        setSuggestions([]);
        setSearchQuery('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSite) {
                await api.put(`/sites/${editingSite.id}`, formData);
            } else {
                await api.post('/sites', formData);
            }
            setIsModalOpen(false);
            setEditingSite(null);
            fetchSites();
            setFormData({ name: '', site_manager: '', location_lat: '', location_lng: '' });
        } catch (error) {
            console.error('Error saving site:', error);
            alert('Failed to save site');
        }
    };

    const handleEdit = (site) => {
        setEditingSite(site);
        setFormData({
            name: site.name,
            site_manager: site.site_manager,
            location_lat: site.location_lat || '',
            location_lng: site.location_lng || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this site?')) {
            try {
                await api.delete(`/sites/${id}`);
                fetchSites();
            } catch (error) {
                console.error('Error deleting site:', error);
                alert('Failed to delete site');
            }
        }
    };

    const columns = [
        { header: 'Site Name', accessor: 'name' },
        { header: 'Manager', accessor: 'site_manager' },
        { header: 'Location', accessor: 'location', render: (row) => row.location_lat && row.location_lng ? `${row.location_lat}, ${row.location_lng}` : 'N/A' },
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
                <h1 className="text-2xl font-bold text-slate-800">Sites</h1>
                <button
                    onClick={() => {
                        setEditingSite(null);
                        setFormData({ name: '', site_manager: '', location_lat: '', location_lng: '' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Site</span>
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <Table columns={columns} data={sites} />
            )}

            <Modal isOpen={isModalOpen} onClose={() => {
                setIsModalOpen(false);
                setSuggestions([]);
                setSearchQuery('');
            }} title={editingSite ? "Edit Site" : "Add New Site"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Search Location (Auto-fill)</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search for a place (e.g. Mumbai Port)..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                value={searchQuery}
                                onChange={(e) => handleLocationSearch(e.target.value)}
                            />
                            {isSearching && (
                                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin" size={18} />
                            )}
                        </div>

                        {suggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {suggestions.map((loc, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSelectLocation(loc)}
                                        className="w-full text-left px-4 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                                    >
                                        <div className="flex items-start space-x-2">
                                            <MapPin className="text-slate-400 shrink-0 mt-1" size={16} />
                                            <div>
                                                <div className="text-sm font-medium text-slate-800 line-clamp-1">{loc.display_name.split(',')[0]}</div>
                                                <div className="text-xs text-slate-500 line-clamp-1">{loc.display_name}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        <p className="mt-1 text-xs text-slate-500">Search and select a place to auto-fill site details.</p>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Site Name</label>
                            <input
                                type="text"
                                required
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Site Manager</label>
                            <input
                                type="text"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                value={formData.site_manager}
                                onChange={(e) => setFormData({ ...formData, site_manager: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.location_lat}
                                    onChange={(e) => setFormData({ ...formData, location_lat: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.location_lng}
                                    onChange={(e) => setFormData({ ...formData, location_lng: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                        >
                            {editingSite ? 'Update Site' : 'Create Site'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SitesPage;
