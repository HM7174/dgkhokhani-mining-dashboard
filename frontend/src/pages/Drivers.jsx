import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Table from '../components/Table';
import Modal from '../components/Modal';
import FileUpload from '../components/FileUpload';
import { Plus, Trash2 } from 'lucide-react';

const DriversPage = () => {
    const navigate = useNavigate();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '', phone: '', assigned_truck_id: '', employment_status: 'active', post: 'Driver', photo_url: '', documents: []
    });
    const [filterPost, setFilterPost] = useState('All');
    const [trucks, setTrucks] = useState([]);

    useEffect(() => {
        fetchDrivers();
        fetchTrucks();
    }, []);

    const fetchDrivers = async () => {
        try {
            const response = await api.get('/drivers');
            setDrivers(response.data);
        } catch (error) {
            console.error('Error fetching drivers:', error);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/drivers', formData);
            setIsModalOpen(false);
            fetchDrivers();
            setFormData({ full_name: '', phone: '', assigned_truck_id: '', employment_status: 'active', post: 'Driver', photo_url: '', documents: [] });
        } catch (error) {
            console.error('Error creating driver:', error);
            alert('Failed to create driver');
        }
    };

    const handleDeleteDriver = async (driverId) => {
        try {
            await api.delete(`/drivers/${driverId}`);
            fetchDrivers();
        } catch (error) {
            console.error('Error deleting driver:', error);
            alert('Failed to delete driver');
        }
    };

    const columns = [
        {
            header: 'Photo',
            accessor: 'photo_url',
            render: (row) => (
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                    {row.photo_url ? (
                        <img src={row.photo_url} alt={row.full_name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Img</div>
                    )}
                </div>
            )
        },
        { header: 'Name', accessor: 'full_name' },
        { header: 'Post', accessor: 'post', render: (row) => row.post || 'Driver' },
        { header: 'Phone', accessor: 'phone' },
        { header: 'Assigned Vehicle', accessor: 'assigned_truck_name', render: (row) => row.assigned_truck_name || 'Unassigned' },
        {
            header: 'Status',
            accessor: 'employment_status',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.employment_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                    {row.employment_status}
                </span>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Drivers</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Driver</span>
                </button>
            </div>

            <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm">
                <span className="text-slate-600 font-medium">Filter by Post:</span>
                <select
                    className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filterPost}
                    onChange={(e) => setFilterPost(e.target.value)}
                >
                    <option value="All">All Posts</option>
                    <option value="Driver">Driver</option>
                    <option value="Operator">Operator</option>
                    <option value="Helper">Helper</option>
                    <option value="Engineer">Engineer</option>
                    <option value="Supervisor">Supervisor</option>
                </select>
            </div>

            {
                loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <Table
                        columns={[
                            ...columns,
                            {
                                header: 'Actions',
                                accessor: 'actions',
                                render: (row) => (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm('Are you sure you want to delete this driver?')) {
                                                handleDeleteDriver(row.id);
                                            }
                                        }}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        title="Delete Driver"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )
                            }
                        ]}

                        data={filterPost === 'All' ? drivers : drivers.filter(d => (d.post || 'Driver') === filterPost)}
                        onRowClick={(driver) => navigate(`/drivers/${driver.id}`)}
                    />
                )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Driver">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Post</label>
                            <select
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                value={formData.post}
                                onChange={(e) => setFormData({ ...formData, post: e.target.value })}
                            >
                                <option value="Driver">Driver</option>
                                <option value="Operator">Operator</option>
                                <option value="Helper">Helper</option>
                                <option value="Engineer">Engineer</option>
                                <option value="Supervisor">Supervisor</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input
                                type="text"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <FileUpload
                            label="Driver Photo"
                            accept="image/*"
                            currentFileUrl={formData.photo_url}
                            onUploadSuccess={(url) => setFormData({ ...formData, photo_url: url })}
                            onDelete={() => setFormData({ ...formData, photo_url: '' })}
                        />
                    </div>

                    {/* Only show vehicle assignment for Driver, Operator, and Helper */}
                    {formData.post !== 'Supervisor' && formData.post !== 'Engineer' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Vehicle</label>
                            <select
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                value={formData.assigned_truck_id}
                                onChange={(e) => setFormData({ ...formData, assigned_truck_id: e.target.value })}
                            >
                                <option value="">Select Vehicle</option>
                                {trucks.map(truck => (
                                    <option key={truck.id} value={truck.id}>{truck.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                        <p>You can add detailed documents and bank information after creating the driver profile.</p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                        >
                            Create Driver
                        </button>
                    </div>
                </form>
            </Modal >
        </div >
    );
};

export default DriversPage;
