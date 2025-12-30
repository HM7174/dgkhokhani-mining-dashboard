import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Save, Plus, Trash2, FileText, User } from 'lucide-react';
import Modal from '../components/Modal';
import FileUpload from '../components/FileUpload';
import { getFileUrl } from '../utils/urlHelper';

const DriverDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [driver, setDriver] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);

    // Form state for driver details
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        aadhar_number: '',
        pan_number: '',
        license_number: '',
        license_expiry: '',
        bank_name: '',
        bank_account_last4: '',
        photo_url: '',
        assigned_truck_id: '', // New field
        documents: []
    });

    const [trucks, setTrucks] = useState([]); // Store all available trucks

    // Form state for new document
    const [newDoc, setNewDoc] = useState({ name: '', url: '', type: 'other' });

    useEffect(() => {
        fetchDriverDetails();
        fetchTrucks(); // Load all trucks
    }, [id]);

    const fetchTrucks = async () => {
        try {
            const response = await api.get('/trucks');
            setTrucks(response.data);
        } catch (error) {
            console.error('Error fetching trucks:', error);
        }
    };

    const fetchDriverDetails = async () => {
        try {
            const response = await api.get(`/drivers/${id}`);
            const data = response.data;
            setDriver(data);

            // Parse documents if it's a string (from JSONB in DB)
            let docs = [];
            if (typeof data.documents === 'string') {
                try {
                    docs = JSON.parse(data.documents);
                } catch (e) {
                    docs = [];
                }
            } else if (Array.isArray(data.documents)) {
                docs = data.documents;
            }

            setFormData({
                full_name: data.full_name || '',
                phone: data.phone || '',
                aadhar_number: data.aadhar_number || '',
                pan_number: data.pan_number || '',
                license_number: data.license_number || '',
                license_expiry: data.license_expiry ? data.license_expiry.split('T')[0] : '',
                bank_name: data.bank_name || '',
                bank_account_last4: data.bank_account_last4 || '',
                photo_url: data.photo_url || '',
                assigned_truck_id: data.assigned_truck_id || '', // Load assignment
                documents: docs
            });
        } catch (error) {
            console.error('Error fetching driver details:', error);
            alert('Failed to load driver details');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        try {
            // We need to send documents as JSON string if the backend expects it, 
            // but based on controller it seems to handle it.
            // However, let's stick to the controller logic.
            // The controller parses documents if it's sent.

            await api.put(`/drivers/${id}`, formData);
            alert('Profile updated successfully');
            fetchDriverDetails();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    const handleAddDocument = () => {
        if (!newDoc.name) return alert('Please enter document name');

        const updatedDocs = [...formData.documents, { ...newDoc, id: Date.now() }];
        setFormData(prev => ({ ...prev, documents: updatedDocs }));
        setNewDoc({ name: '', url: '', type: 'other' });
        setIsDocModalOpen(false);

        // Auto-save or wait for manual save? Let's auto-save for documents to be safe
        // Or better, just update local state and let user click "Save Changes" for everything?
        // The prompt implies "Add new option with along Document add section", so maybe immediate?
        // Let's stick to one "Save Changes" button for the whole profile to be atomic.
    };

    const handleDeleteDocument = (docId) => {
        const updatedDocs = formData.documents.filter(d => d.id !== docId);
        setFormData(prev => ({ ...prev, documents: updatedDocs }));
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!driver) return <div className="p-8 text-center">Driver not found</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/drivers')}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800">Driver Details</h1>
                </div>
                <button
                    onClick={handleSaveProfile}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                    <Save size={20} />
                    <span>Save Changes</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Photo & Basic Info */}
                <div className="md:col-span-1 space-y-6">
                    {/* Photo Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
                        <div className="w-40 h-40 bg-slate-100 rounded-full mb-4 flex items-center justify-center overflow-hidden border-4 border-white shadow-md relative group">
                            {formData.photo_url ? (
                                <img src={getFileUrl(formData.photo_url)} alt={formData.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <User size={64} className="text-slate-300" />
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <span className="text-white text-xs font-medium">Change Photo URL</span>
                            </div>
                        </div>

                        <div className="w-full mb-4">
                            <FileUpload
                                label="Update Photo"
                                accept="image/*"
                                currentFileUrl={formData.photo_url}
                                onUploadSuccess={(url) => setFormData({ ...formData, photo_url: url })}
                                onDelete={() => setFormData({ ...formData, photo_url: '' })}
                            />
                        </div>

                        <h2 className="text-xl font-bold text-slate-800">{formData.full_name}</h2>
                        <p className="text-slate-500">{formData.phone}</p>
                        <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold inline-block ${formData.employment_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                            {driver.employment_status}
                        </div>
                    </div>

                    {/* Quick Stats or Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4">Assignment</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Current Vehicle</label>
                                <select
                                    name="assigned_truck_id"
                                    value={formData.assigned_truck_id}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                    <option value="">Unassigned</option>
                                    {trucks.map(truck => (
                                        <option key={truck.id} value={truck.id}>
                                            {truck.name} ({truck.registration_number || 'No Plate'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Form & Documents */}
                <div className="md:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Aadhar Number</label>
                                <input
                                    type="text"
                                    name="aadhar_number"
                                    value={formData.aadhar_number}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">PAN Number</label>
                                <input
                                    type="text"
                                    name="pan_number"
                                    value={formData.pan_number}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* License & Bank Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2">License & Bank Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
                                <input
                                    type="text"
                                    name="license_number"
                                    value={formData.license_number}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">License Expiry</label>
                                <input
                                    type="date"
                                    name="license_expiry"
                                    value={formData.license_expiry}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
                                <input
                                    type="text"
                                    name="bank_name"
                                    value={formData.bank_name}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Account (Last 4)</label>
                                <input
                                    type="text"
                                    name="bank_account_last4"
                                    maxLength="4"
                                    value={formData.bank_account_last4}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Documents Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4 border-b pb-2">
                            <h3 className="font-semibold text-slate-800">Documents</h3>
                            <button
                                onClick={() => setIsDocModalOpen(true)}
                                className="text-sm flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <Plus size={16} />
                                <span>Add Document</span>
                            </button>
                        </div>

                        {formData.documents.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                                <p>No documents added yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {formData.documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-100 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{doc.name}</p>
                                                <a href={getFileUrl(doc.url)} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate max-w-[200px] block">
                                                    View Document
                                                </a>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteDocument(doc.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Document Modal */}
            <Modal isOpen={isDocModalOpen} onClose={() => setIsDocModalOpen(false)} title="Add New Document">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Document Name</label>
                        <input
                            type="text"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g. Driving License Front"
                            value={newDoc.name}
                            onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <FileUpload
                            label="Document File (PDF)"
                            accept="application/pdf"
                            currentFileUrl={newDoc.url}
                            onUploadSuccess={(url) => setNewDoc({ ...newDoc, url: url, type: 'pdf' })}
                            onDelete={() => setNewDoc({ ...newDoc, url: '' })}
                        />
                    </div>
                    <div className="pt-4">
                        <button
                            onClick={handleAddDocument}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                        >
                            Add Document
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DriverDetails;
