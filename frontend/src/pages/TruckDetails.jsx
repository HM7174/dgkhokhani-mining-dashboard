import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Save, Truck, Tool, Activity, MapPin, Calendar, FileText } from 'lucide-react';

const TruckDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [truck, setTruck] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sites, setSites] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        type: 'truck',
        registration_number: '',
        site_id: '',
        status: 'active',
        puc_expiry: '',
        insurance_expiry: '',
        insurance_provider: '',
        gps_device_id: ''
    });

    useEffect(() => {
        fetchTruckDetails();
        fetchSites();
    }, [id]);

    const fetchTruckDetails = async () => {
        try {
            const response = await api.get(`/trucks/${id}`);
            const data = response.data;
            setTruck(data);

            setFormData({
                name: data.name || '',
                type: data.type || 'truck',
                registration_number: data.registration_number || '',
                site_id: data.site_id || '',
                status: data.status || 'active',
                puc_expiry: data.puc_expiry ? data.puc_expiry.split('T')[0] : '',
                insurance_expiry: data.insurance_expiry ? data.insurance_expiry.split('T')[0] : '',
                insurance_provider: data.insurance_provider || '',
                gps_device_id: data.gps_device_id || ''
            });
        } catch (error) {
            console.error('Error fetching truck details:', error);
            alert('Failed to load truck details');
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            await api.put(`/trucks/${id}`, formData);
            alert('Vehicle updated successfully');
            fetchTruckDetails();
        } catch (error) {
            console.error('Error updating vehicle:', error);
            alert('Failed to update vehicle');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading vehicle details...</div>;
    if (!truck) return <div className="p-8 text-center text-slate-500">Vehicle not found</div>;

    const isTruck = formData.type === 'truck';

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/trucks')}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800">Vehicle Details</h1>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors shadow-sm"
                >
                    <Save size={20} />
                    <span>Save Changes</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Visual & Key Info */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
                        <div className={`w-32 h-32 rounded-full mb-4 flex items-center justify-center border-4 border-slate-50 ${isTruck ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                            {isTruck ? <Truck size={64} /> : <Tool size={64} />}
                        </div>

                        <div className="mb-4 w-full">
                            <div className="inline-block border-2 border-slate-800 rounded px-4 py-1 bg-yellow-300 text-slate-900 font-mono font-bold text-lg shadow-sm w-full max-w-[200px]">
                                {formData.registration_number || 'NO PLATE'}
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-slate-800 break-words w-full">{formData.name}</h2>
                        <div className="mt-2 flex gap-2 justify-center">
                            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 uppercase">
                                {formData.type}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${formData.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                {formData.status}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-blue-500" />
                            Usage Statistics
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Total Distance</label>
                                <p className="font-bold text-2xl text-slate-800">{truck.total_km || 0} <span className="text-sm font-normal text-slate-500">km</span></p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Avg. Consumption</label>
                                <p className="font-bold text-xl text-slate-800">{truck.avg_km_per_litre || 0} <span className="text-sm font-normal text-slate-500">km/L</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Editable Form */}
                <div className="md:col-span-2 space-y-6">
                    {/* General Information */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                            <FileText size={18} className="text-blue-500" />
                            General Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name / Identifier</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="truck">Truck</option>
                                    <option value="machine">Machine</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Registration Number</label>
                                <input
                                    type="text"
                                    name="registration_number"
                                    value={formData.registration_number}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Site</label>
                                <select
                                    name="site_id"
                                    value={formData.site_id}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Site</option>
                                    {sites.map(site => (
                                        <option key={site.id} value={site.id}>{site.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="in-repair">In Repair</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">GPS Device ID</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        name="gps_device_id"
                                        value={formData.gps_device_id}
                                        onChange={handleInputChange}
                                        className="w-full pl-9 border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Device Serial #"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Maintenance & Compliance */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                            <Calendar size={18} className="text-blue-500" />
                            Maintenance & Compliance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">PUC Expiry</label>
                                <input
                                    type="date"
                                    name="puc_expiry"
                                    value={formData.puc_expiry}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Insurance Expiry</label>
                                <input
                                    type="date"
                                    name="insurance_expiry"
                                    value={formData.insurance_expiry}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Insurance Provider</label>
                                <input
                                    type="text"
                                    name="insurance_provider"
                                    value={formData.insurance_provider}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Insurance Company Name"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TruckDetails;
