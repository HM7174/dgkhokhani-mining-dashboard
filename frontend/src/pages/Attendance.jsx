import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Plus, Upload } from 'lucide-react';
import { exportToCSV } from '../utils/excelUtils';

const AttendancePage = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        driver_id: '', date: new Date().toISOString().split('T')[0], status: 'present', notes: ''
    });
    const [drivers, setDrivers] = useState([]);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        fetchAttendance();
        fetchDrivers();
    }, []);

    const fetchAttendance = async () => {
        try {
            const response = await api.get('/attendance');
            setRecords(response.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDrivers = async () => {
        try {
            const response = await api.get('/drivers');
            setDrivers(response.data);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/attendance', formData);
            setIsModalOpen(false);
            fetchAttendance();
            setFormData({
                driver_id: '', date: new Date().toISOString().split('T')[0], status: 'present', notes: ''
            });
        } catch (error) {
            console.error('Error marking attendance:', error);
            alert('Failed to mark attendance');
        }
    };

    const columns = [
        { header: 'Date', accessor: 'date', render: (row) => new Date(row.date).toLocaleDateString() },
        { header: 'Driver', accessor: 'full_name' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {row.status}
                </span>
            )
        },
        { header: 'Notes', accessor: 'notes' },
    ];

    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/attendance/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(`Successfully imported ${response.data.count} attendance records`);
            fetchAttendance();
        } catch (error) {
            console.error('Error importing Excel:', error);
            if (error.response?.data?.errors) {
                alert('Import failed:\n' + error.response.data.errors.join('\n'));
            } else {
                alert('Failed to import Excel file');
            }
        } finally {
            setImporting(false);
            e.target.value = ''; // Reset file input
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
                <div className="flex space-x-2">
                    <label className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer">
                        <Upload size={20} />
                        <span>{importing ? 'Importing...' : 'Import Excel'}</span>
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleImportExcel}
                            className="hidden"
                            disabled={importing}
                        />
                    </label>
                    <button
                        onClick={() => exportToCSV(records, 'attendance_records')}
                        className="flex items-center space-x-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg transition-colors"
                    >
                        <Upload size={20} className="rotate-180" />
                        <span>Export CSV</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus size={20} />
                        <span>Mark Attendance</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <Table columns={columns} data={records} />
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Mark Attendance">
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
                            <label className="block text-sm font-medium text-slate-700 mb-1">Driver</label>
                            <select
                                required
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                value={formData.driver_id}
                                onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                            >
                                <option value="">Select Driver</option>
                                {drivers.map(driver => (
                                    <option key={driver.id} value={driver.id}>{driver.full_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                        <textarea
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                        >
                            Save Record
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AttendancePage;
