import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Plus, Upload, Calendar, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { exportToCSV } from '../utils/excelUtils';

const AttendancePage = () => {
    const [records, setRecords] = useState([]);
    const [dailyRecords, setDailyRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [view, setView] = useState('daily'); // 'daily' or 'history'
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [formData, setFormData] = useState({
        driver_id: '', date: new Date().toISOString().split('T')[0], status: 'present', notes: ''
    });
    const [drivers, setDrivers] = useState([]);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        if (view === 'daily') {
            fetchDailyAttendance();
        } else {
            fetchAttendance();
        }
        fetchDrivers();
    }, [view, selectedDate]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const response = await api.get('/attendance');
            setRecords(response.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDailyAttendance = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/attendance?date=${selectedDate}&include_all_drivers=true`);
            setDailyRecords(response.data);
        } catch (error) {
            console.error('Error fetching daily attendance:', error);
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

    const handleMarkAttendance = async (driverId, status) => {
        try {
            await api.post('/attendance', {
                driver_id: driverId,
                date: selectedDate,
                status: status,
                notes: ''
            });
            fetchDailyAttendance();
        } catch (error) {
            console.error('Error marking attendance:', error);
            alert('Failed to mark attendance');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/attendance', formData);
            setIsModalOpen(false);
            if (view === 'history') fetchAttendance();
            else fetchDailyAttendance();
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
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${row.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {row.status === 'present' ? 'P' : 'A'}
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
            if (view === 'daily') fetchDailyAttendance();
            else fetchAttendance();
        } catch (error) {
            console.error('Error importing Excel:', error);
            alert(error.response?.data?.error || 'Failed to import Excel file');
        } finally {
            setImporting(false);
            e.target.value = '';
        }
    };

    const changeDate = (days) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Attendance</h1>
                    <p className="text-slate-500 mt-1">Manage driver attendance and imports</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer group">
                        <Upload size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">{importing ? 'Importing...' : 'Import Excel'}</span>
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleImportExcel}
                            className="hidden"
                            disabled={importing}
                        />
                    </label>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition-all shadow-md font-semibold"
                    >
                        <Plus size={18} />
                        <span>Manual Entry</span>
                    </button>
                </div>
            </div>

            {/* View Switcher & Date Selector */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                    <button
                        onClick={() => setView('daily')}
                        className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'daily' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Daily Mark
                    </button>
                    <button
                        onClick={() => setView('history')}
                        className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        History
                    </button>
                </div>

                {view === 'daily' && (
                    <div className="flex items-center bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
                        <button onClick={() => changeDate(-1)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-600">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center px-4 font-bold text-slate-700 gap-2">
                            <Calendar size={16} className="text-slate-400" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-sm cursor-pointer"
                            />
                        </div>
                        <button onClick={() => changeDate(1)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-600">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Loading attendance data...</p>
                </div>
            ) : view === 'daily' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dailyRecords.length > 0 ? dailyRecords.map(record => (
                        <div key={record.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <h3 className="font-bold text-slate-800">{record.full_name}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">ID: {record.id.slice(0, 8)}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleMarkAttendance(record.id, 'present')}
                                    className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all font-black text-lg ${record.status === 'present'
                                        ? 'bg-green-600 text-white ring-4 ring-green-100'
                                        : 'bg-slate-100 text-slate-400 hover:bg-green-50 hover:text-green-600'
                                        }`}
                                >
                                    P
                                </button>
                                <button
                                    onClick={() => handleMarkAttendance(record.id, 'absent')}
                                    className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all font-black text-lg ${record.status === 'absent'
                                        ? 'bg-red-600 text-white ring-4 ring-red-100'
                                        : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600'
                                        }`}
                                >
                                    A
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-16 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                            <p className="text-slate-400 font-medium">No active drivers found.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <Table columns={columns} data={records} />
                </div>
            )}

            {/* Manual Entry Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Manual Attendance Entry">
                <form onSubmit={handleSubmit} className="p-4 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-slate-700">Date</label>
                            <input
                                type="date"
                                required
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-slate-700">Driver</label>
                            <select
                                required
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
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

                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-slate-700">Status</label>
                        <div className="flex gap-4">
                            {['present', 'absent'].map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: s })}
                                    className={`flex-1 py-3 rounded-xl font-bold uppercase transition-all tracking-wider ${formData.status === s
                                        ? s === 'present' ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-red-600 text-white shadow-lg shadow-red-200'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-slate-700">Notes (Optional)</label>
                        <textarea
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                            rows="3"
                            placeholder="Add any additional information..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
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
