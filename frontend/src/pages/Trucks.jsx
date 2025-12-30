import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import TruckCard from '../components/TruckCard';
import { Plus, Search, Filter } from 'lucide-react';

const TrucksPage = () => {
    const navigate = useNavigate();
    const [trucks, setTrucks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '', type: 'truck', registration_number: '', site_id: '', status: 'active'
    });
    const [sites, setSites] = useState([]);

    // Filtering and Search State
    const [filterType, setFilterType] = useState('all'); // 'all', 'truck', 'machine'
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTrucks();
        fetchSites();
    }, []);

    const fetchTrucks = async () => {
        try {
            const response = await api.get('/trucks');
            setTrucks(response.data);
        } catch (error) {
            console.error('Error fetching trucks:', error);
        } finally {
            setLoading(false);
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
            await api.post('/trucks', formData);
            setIsModalOpen(false);
            fetchTrucks();
            setFormData({ name: '', type: 'truck', registration_number: '', site_id: '', status: 'active' });
        } catch (error) {
            console.error('Error creating truck:', error);
            alert('Failed to create truck');
        }
    };

    const handleCardClick = (truck) => {
        navigate(`/trucks/${truck.id}`);
    };

    // Filter Logic
    const filteredTrucks = trucks.filter(truck => {
        const matchesType = filterType === 'all' || truck.type === filterType;
        const matchesSearch =
            truck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (truck.registration_number && truck.registration_number.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesType && matchesSearch;
    });

    const handleDelete = async (id) => {
        try {
            await api.delete(`/trucks/${id}`);
            fetchTrucks();
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            alert('Failed to delete vehicle');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-800">Trucks & Machines</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    <span>Add Vehicle</span>
                </button>
            </div>

            {/* Filters and Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
                    {['all', 'truck', 'excavator', 'grader', 'roller'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all flex-1 md:flex-none whitespace-nowrap ${filterType === type
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {type === 'all' ? 'All Vehicles' : type === 'truck' ? 'Trucks' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or number plate..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500">Loading vehicles...</div>
            ) : filteredTrucks.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <Filter className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">No vehicles found matching your filters</p>
                    <button
                        onClick={() => { setFilterType('all'); setSearchQuery(''); }}
                        className="mt-2 text-blue-600 hover:underline text-sm"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTrucks.map((truck) => (
                        <TruckCard
                            key={truck.id}
                            vehicle={truck}
                            onClick={handleCardClick}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Vehicle">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name / Identifier</label>
                        <input
                            type="text"
                            required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                        <select
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="truck">Truck</option>
                            <option value="excavator">Excavator</option>
                            <option value="grader">Grader</option>
                            <option value="roller">Roller</option>
                            <option value="loader">Loader</option>
                            <option value="dumper">Dumper</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Registration Number</label>
                        <input
                            type="text"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.registration_number}
                            onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Site</label>
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
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                        >
                            Create Vehicle
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TrucksPage;
