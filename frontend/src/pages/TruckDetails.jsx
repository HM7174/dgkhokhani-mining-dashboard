import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Save, Truck, Wrench, Activity, MapPin, Calendar, FileText, Plus, Trash2, IndianRupee, NotebookPen } from 'lucide-react';
import Modal from '../components/Modal';
import FileUpload from '../components/FileUpload';
import { getFileUrl } from '../utils/urlHelper';

const TruckDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [truck, setTruck] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sites, setSites] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loadingExpenses, setLoadingExpenses] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        type: 'truck',
        registration_number: '',
        site_id: '',
        status: 'active',
        puc_expiry: '',
        insurance_expiry: '',
        insurance_provider: '',
        gps_device_id: '',
        documents: [],
        notes: ''
    });

    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [newDoc, setNewDoc] = useState({ name: '', url: '', type: 'other' });

    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [expenseForm, setExpenseForm] = useState({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Maintenance'
    });

    useEffect(() => {
        fetchTruckDetails();
        fetchSites();
        fetchExpenses();
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
                gps_device_id: data.gps_device_id || '',
                notes: data.notes || '',
                documents: (() => {
                    if (typeof data.documents === 'string') {
                        try { return JSON.parse(data.documents); } catch (e) { return []; }
                    }
                    return Array.isArray(data.documents) ? data.documents : [];
                })()
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

    const fetchExpenses = async () => {
        setLoadingExpenses(true);
        try {
            const response = await api.get(`/expenses?truck_id=${id}`);
            setExpenses(response.data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoadingExpenses(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddDocument = async () => {
        if (!newDoc.name || !newDoc.url) return alert('Please enter document name and upload a file');

        const updatedDocs = [...formData.documents, { ...newDoc, id: Date.now() }];

        try {
            const updatedFormData = { ...formData, documents: updatedDocs };
            await api.put(`/trucks/${id}`, updatedFormData);

            setFormData(updatedFormData);
            setNewDoc({ name: '', url: '', type: 'other' });
            setIsDocModalOpen(false);
            alert('Document added and saved successfully');
        } catch (error) {
            console.error('Error auto-saving document:', error);
            alert('Document failed to save to server.');
            setIsDocModalOpen(false);
        }
    };

    const handleDeleteDocument = async (docId) => {
        if (!window.confirm('Delete this document?')) return;
        const updatedDocs = formData.documents.filter(d => d.id !== docId);
        try {
            const updatedFormData = { ...formData, documents: updatedDocs };
            await api.put(`/trucks/${id}`, updatedFormData);
            setFormData(updatedFormData);
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Failed to delete document');
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            await api.post('/expenses', { ...expenseForm, truck_id: id });
            setIsExpenseModalOpen(false);
            setExpenseForm({
                description: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                category: 'Maintenance'
            });
            fetchExpenses();
            alert('Expense added successfully');
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('Failed to add expense');
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        if (!window.confirm('Delete this expense?')) return;
        try {
            await api.delete(`/expenses/${expenseId}`);
            fetchExpenses();
        } catch (error) {
            console.error('Error deleting expense:', error);
            alert('Failed to delete expense');
        }
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
    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/trucks')}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Vehicle Details</h1>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={async () => {
                            if (window.confirm('Are you sure you want to archive this vehicle? It will be moved to the "Completed Sites & Archive" section.')) {
                                try {
                                    await api.delete(`/trucks/${id}`);
                                    navigate('/trucks');
                                } catch (error) {
                                    console.error('Error archiving vehicle:', error);
                                    alert('Failed to archive vehicle');
                                }
                            }
                        }}
                        className="flex items-center space-x-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <Trash2 size={20} />
                        <span>Archive</span>
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <Save size={20} />
                        <span>Save Changes</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Visual & Key Info */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
                        <div className={`w-32 h-32 rounded-full mb-4 flex items-center justify-center border-4 border-slate-50 ${isTruck ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                            {isTruck ? <Truck size={64} /> : <Wrench size={64} />}
                        </div>

                        <div className="mb-4 w-full">
                            <div className="inline-block border-2 border-slate-800 rounded px-4 py-1 bg-yellow-300 text-slate-900 font-mono font-bold text-lg shadow-sm w-full max-w-[200px]">
                                {formData.registration_number || 'NO PLATE'}
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-slate-800 break-words w-full">{formData.name}</h2>
                        <div className="mt-2 flex gap-2 justify-center">
                            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                {formData.type}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${formData.status === 'active'
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
                            Statistics
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Total Distance</label>
                                <p className="font-bold text-2xl text-slate-800">{truck.total_km || 0} <span className="text-sm font-normal text-slate-500">km</span></p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Extra Expenses</label>
                                <p className="font-bold text-2xl text-red-600">
                                    <span className="text-sm">₹</span> {totalExpenses.toLocaleString()}
                                </p>
                                <p className="text-[10px] text-slate-400">Total spent on maintenance & repairs</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Editable Form */}
                <div className="md:col-span-2 space-y-6">
                    {/* General Information */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                            <FileText size={18} className="text-blue-500" />
                            General Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 uppercase">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Name / Identifier</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
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
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Registration Number</label>
                                <input
                                    type="text"
                                    name="registration_number"
                                    value={formData.registration_number}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Assigned Site</label>
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
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Status</label>
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
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">GPS Device ID</label>
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

                    {/* Notes Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                            <NotebookPen size={18} className="text-blue-500" />
                            Vehicle Notes
                        </h3>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="Add specific notes about this vehicle (e.g., service history, driver issues)..."
                            rows={4}
                            className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 text-sm italic"
                        />
                    </div>

                    {/* Expenses Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <IndianRupee size={18} className="text-blue-500" />
                                Extra Expenses
                            </h3>
                            <button
                                onClick={() => setIsExpenseModalOpen(true)}
                                className="text-xs flex items-center space-x-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700 font-bold transition-colors"
                            >
                                <Plus size={14} />
                                <span>Add Expense</span>
                            </button>
                        </div>

                        {loadingExpenses ? (
                            <div className="text-center py-4 text-slate-400 text-sm italic">Loading expenses...</div>
                        ) : expenses.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <IndianRupee size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No expenses recorded for this vehicle</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {expenses.map((exp) => (
                                    <div key={exp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-red-100 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                                                <IndianRupee size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm uppercase">{exp.description}</p>
                                                <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-medium">
                                                    <span>{new Date(exp.date).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span className="bg-slate-200 px-1 rounded uppercase tracking-tighter">{exp.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <p className="font-bold text-slate-800">₹{parseFloat(exp.amount).toLocaleString()}</p>
                                            <button
                                                onClick={() => handleDeleteExpense(exp.id)}
                                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Maintenance & Compliance */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                            <Calendar size={18} className="text-blue-500" />
                            Maintenance & Compliance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider">PUC Expiry</label>
                                <input
                                    type="date"
                                    name="puc_expiry"
                                    value={formData.puc_expiry}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider">Insurance Expiry</label>
                                <input
                                    type="date"
                                    name="insurance_expiry"
                                    value={formData.insurance_expiry}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider">Insurance Provider</label>
                                <input
                                    type="text"
                                    name="insurance_provider"
                                    value={formData.insurance_provider}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                                    placeholder="Insurance Company Name"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Documents Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <FileText size={18} className="text-blue-500" />
                                Documents
                            </h3>
                            <button
                                onClick={() => setIsDocModalOpen(true)}
                                className="text-xs flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-bold"
                            >
                                <Plus size={16} />
                                <span>Add Document</span>
                            </button>
                        </div>

                        {formData.documents.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No documents uploaded</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {formData.documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-100 transition-colors">
                                        <div className="flex items-center space-x-3 overflow-hidden">
                                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                                                <FileText size={20} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-bold text-slate-800 text-sm truncate uppercase">{doc.name}</p>
                                                <a href={getFileUrl(doc.url)} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline truncate block uppercase font-bold tracking-tight">
                                                    View Persistent Link
                                                </a>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteDocument(doc.id)}
                                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

            {/* Add Expense Modal */}
            <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Record Extra Expense">
                <form onSubmit={handleAddExpense} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <input
                            type="text"
                            required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g. Engine Oil Change"
                            value={expenseForm.description}
                            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                            <input
                                type="number"
                                required
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                value={expenseForm.amount}
                                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                            <input
                                type="date"
                                required
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                value={expenseForm.date}
                                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <select
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={expenseForm.category}
                            onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                        >
                            <option value="Maintenance">Maintenance</option>
                            <option value="Repair">Repair</option>
                            <option value="Fuel (Extra)">Fuel (Extra)</option>
                            <option value="Tyres">Tyres</option>
                            <option value="Misc">Misc</option>
                        </select>
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold transition-colors shadow-sm uppercase"
                        >
                            Save Expense
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Add Document Modal */}
            <Modal isOpen={isDocModalOpen} onClose={() => setIsDocModalOpen(false)} title="Add New Document">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 italic">Document Name</label>
                        <input
                            type="text"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g. Insurance Policy"
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
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold transition-colors uppercase shadow-sm"
                        >
                            Add Document
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TruckDetails;
