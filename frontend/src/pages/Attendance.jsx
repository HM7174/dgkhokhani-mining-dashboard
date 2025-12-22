import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Plus, Upload, Calendar, ChevronLeft, ChevronRight, Check, X, Grid, List, Download, Trash2 } from 'lucide-react';

const AttendancePage = () => {
    const [records, setRecords] = useState([]);
    const [dailyRecords, setDailyRecords] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [view, setView] = useState('grid'); // 'grid', 'daily' or 'history'
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [formData, setFormData] = useState({
        driver_id: '', date: new Date().toISOString().split('T')[0], status: 'present', notes: ''
    });
    const [drivers, setDrivers] = useState([]);
    const [importing, setImporting] = useState(false);

    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    useEffect(() => {
        if (view === 'daily') {
            fetchDailyAttendance();
        } else if (view === 'history') {
            fetchAttendance();
        } else if (view === 'grid') {
            fetchMonthlyAttendance();
        }
        fetchDrivers();
    }, [view, selectedDate, currentYear, currentMonth]);

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

    const fetchMonthlyAttendance = async () => {
        setLoading(true);
        try {
            // Note: We fetch all and filter client-side for simplicity in this template version, 
            // but in production we should filter by year/month on backend.
            const response = await api.get('/attendance');
            const filtered = response.data.filter(r => {
                const d = new Date(r.date);
                return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
            });
            setMonthlyData(filtered);
        } catch (error) {
            console.error('Error fetching monthly data:', error);
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

    const handleMarkAttendance = async (driverId, status, dateToMark) => {
        try {
            await api.post('/attendance', {
                driver_id: driverId,
                date: dateToMark || selectedDate,
                status: status,
                notes: ''
            });
            if (view === 'daily') fetchDailyAttendance();
            else if (view === 'grid') fetchMonthlyAttendance();
        } catch (error) {
            console.error('Error marking attendance:', error);
            alert('Failed to mark attendance');
        }
    };

    const toggleStatus = async (driverId, currentDate, existingStatus) => {
        let nextStatus = 'none';
        if (existingStatus === 'none') nextStatus = 'present';
        else if (existingStatus === 'present') nextStatus = 'absent';
        else if (existingStatus === 'absent') nextStatus = 'present';

        await handleMarkAttendance(driverId, nextStatus, currentDate);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/attendance', formData);
            setIsModalOpen(false);
            if (view === 'history') fetchAttendance();
            else if (view === 'daily') fetchDailyAttendance();
            else fetchMonthlyAttendance();
            setFormData({
                driver_id: '', date: new Date().toISOString().split('T')[0], status: 'present', notes: ''
            });
        } catch (error) {
            console.error('Error marking attendance:', error);
            alert('Failed to mark attendance');
        }
    };

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
            else if (view === 'grid') fetchMonthlyAttendance();
            else fetchAttendance();
        } catch (error) {
            console.error('Error importing Excel:', error);
            alert(error.response?.data?.error || 'Failed to import Excel file');
        } finally {
            e.target.value = '';
        }
    };

    const handleDeleteAttendance = async (id) => {
        try {
            await api.delete(`/attendance/${id}`);
            if (view === 'history') fetchAttendance();
            else if (view === 'daily') fetchDailyAttendance();
            else fetchMonthlyAttendance();
        } catch (error) {
            console.error('Error deleting attendance:', error);
            alert('Failed to delete attendance record');
        }
    };

    const daysInMonth = useMemo(() => new Date(currentYear, currentMonth + 1, 0).getDate(), [currentYear, currentMonth]);

    const gridData = useMemo(() => {
        return drivers.map(driver => {
            const driverAttendance = {};
            monthlyData.filter(r => r.driver_id === driver.id).forEach(r => {
                const day = new Date(r.date).getDate();
                driverAttendance[day] = r.status;
            });

            let totalP = 0;
            let totalA = 0;
            Object.values(driverAttendance).forEach(s => {
                if (s === 'present') totalP++;
                else if (s === 'absent') totalA++;
            });

            return { ...driver, attendance: driverAttendance, totalP, totalA };
        });
    }, [drivers, monthlyData, currentYear, currentMonth]);

    const changeDate = (days) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const changeMonth = (delta) => {
        let newMonth = currentMonth + delta;
        let newYear = currentYear;
        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    return (
        <div className="max-w-[100vw] mx-auto space-y-4 p-4 lg:p-6 bg-slate-50 min-h-screen overflow-x-hidden">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 text-indigo-600">
                        <Calendar size={32} />
                        Attendance
                    </h1>
                    <p className="text-slate-500 font-medium ml-11 uppercase text-xs tracking-widest">Monthly Grid Logic Integrated</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 ml-11 lg:ml-0">
                    <button
                        onClick={async () => {
                            try {
                                const token = localStorage.getItem('token');
                                const response = await fetch(`${api.defaults.baseURL}/attendance/export`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                if (!response.ok) throw new Error('Download failed');
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'DG_KHOKHANI_ATTENDANCE.xlsx';
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                            } catch (error) {
                                console.error('Export error:', error);
                                alert('Failed to download Excel file');
                            }
                        }}
                        className="flex items-center space-x-2 bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-600 px-5 py-2.5 rounded-2xl transition-all shadow-sm font-bold active:scale-95"
                    >
                        <Download size={18} />
                        <span>Export</span>
                    </button>
                    <label className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-emerald-100 cursor-pointer group active:scale-95">
                        <Upload size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="font-bold">{importing ? 'Importing...' : 'Import Excel'}</span>
                        <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} className="hidden" disabled={importing} />
                    </label>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-indigo-100 font-bold active:scale-95"
                    >
                        <Plus size={18} />
                        <span>Manual Entry</span>
                    </button>
                </div>
            </div>

            {/* View Switcher & Controls */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-2 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto">
                    {[
                        { id: 'grid', label: 'Grid View', icon: Grid },
                        { id: 'daily', label: 'Daily', icon: Check },
                        { id: 'history', label: 'History', icon: List }
                    ].map(v => (
                        <button
                            key={v.id}
                            onClick={() => setView(v.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${view === v.id ? 'bg-white text-indigo-600 shadow-md transform scale-105' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <v.icon size={16} />
                            <span className="hidden sm:inline">{v.label}</span>
                        </button>
                    ))}
                </div>

                {view === 'grid' ? (
                    <div className="flex items-center bg-slate-50 px-4 py-1.5 rounded-2xl border border-slate-200 shadow-inner">
                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-600 transition-all active:scale-90">
                            <ChevronLeft size={20} className="stroke-[3]" />
                        </button>
                        <div className="px-6 font-black text-slate-800 text-lg w-48 text-center select-none uppercase tracking-widest">
                            {monthNames[currentMonth]} {currentYear}
                        </div>
                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-600 transition-all active:scale-90">
                            <ChevronRight size={20} className="stroke-[3]" />
                        </button>
                    </div>
                ) : view === 'daily' && (
                    <div className="flex items-center bg-slate-50 px-4 py-1 rounded-2xl border border-slate-200 shadow-inner">
                        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-600 active:scale-90">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center px-4 font-black text-slate-700 gap-2">
                            <Calendar size={18} className="text-indigo-400" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-sm font-bold cursor-pointer"
                            />
                        </div>
                        <button onClick={() => changeDate(1)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-600 active:scale-90">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Loading Data Matrix...</p>
                </div>
            ) : view === 'grid' ? (
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden relative">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-20 bg-slate-50 shadow-sm">
                                <tr>
                                    <th className="sticky left-0 z-30 bg-white border-b border-r border-slate-200 p-4 text-left min-w-[200px]">
                                        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Driver</div>
                                        <div className="text-sm font-black text-slate-800">FULL NAME</div>
                                    </th>
                                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                                        <th key={day} className="border-b border-slate-200 p-2 min-w-[40px] text-center bg-slate-50/50">
                                            <div className="text-[10px] text-slate-400 font-bold">{day}</div>
                                        </th>
                                    ))}
                                    <th className="border-b border-slate-200 p-2 min-w-[60px] text-center bg-green-50/50">
                                        <div className="text-[10px] text-green-600 font-black">PRES</div>
                                    </th>
                                    <th className="border-b border-slate-200 p-2 min-w-[60px] text-center bg-red-50/50">
                                        <div className="text-[10px] text-red-600 font-black">ABS</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {gridData.map((driver, idx) => (
                                    <tr key={driver.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-indigo-50/30 transition-colors group`}>
                                        <td className="sticky left-0 z-10 bg-inherit border-r border-slate-200 p-4 shadow-[5px_0_10px_rgba(0,0,0,0.02)]">
                                            <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase text-sm truncate">{driver.full_name}</div>
                                        </td>
                                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                                            const status = driver.attendance[day] || 'none';
                                            const currentDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                            return (
                                                <td key={day} className="p-0 border-r border-slate-100 last:border-r-0">
                                                    <button
                                                        onClick={() => toggleStatus(driver.id, currentDate, status)}
                                                        className={`w-full h-11 flex items-center justify-center font-black transition-all ${status === 'present'
                                                            ? 'bg-green-600 text-white shadow-inner scale-105 rounded-md mx-0.5'
                                                            : status === 'absent'
                                                                ? 'bg-red-600 text-white shadow-inner scale-105 rounded-md mx-0.5'
                                                                : 'hover:bg-slate-100 text-slate-200'
                                                            }`}
                                                    >
                                                        {status === 'present' ? 'P' : status === 'absent' ? 'A' : ''}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                        <td className="text-center font-black text-green-600 text-sm bg-green-50/20">{driver.totalP}</td>
                                        <td className="text-center font-black text-red-600 text-sm bg-red-50/20">{driver.totalA}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : view === 'daily' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {dailyRecords.length > 0 ? dailyRecords.map(record => (
                        <div key={record.id} className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 hover:shadow-2xl hover:border-indigo-100 transition-all group overflow-hidden relative">
                            <div className="relative z-10">
                                <h3 className="font-black text-slate-800 text-lg uppercase truncate">{record.full_name}</h3>
                                <div className="flex gap-4 mt-8">
                                    <button
                                        onClick={() => handleMarkAttendance(record.id, 'present')}
                                        className={`flex-1 flex flex-col items-center justify-center p-4 rounded-3xl transition-all ${record.status === 'present'
                                            ? 'bg-green-600 text-white shadow-xl shadow-green-200 scale-105 ring-4 ring-green-100'
                                            : 'bg-slate-50 text-slate-400 hover:bg-green-50 hover:text-green-600'
                                            }`}
                                    >
                                        <span className="text-2xl font-black">P</span>
                                        <span className="text-[9px] font-black uppercase mt-1">Present</span>
                                    </button>
                                    <button
                                        onClick={() => handleMarkAttendance(record.id, 'absent')}
                                        className={`flex-1 flex flex-col items-center justify-center p-4 rounded-3xl transition-all ${record.status === 'absent'
                                            ? 'bg-red-600 text-white shadow-xl shadow-red-200 scale-105 ring-4 ring-red-100'
                                            : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600'
                                            }`}
                                    >
                                        <span className="text-2xl font-black">A</span>
                                        <span className="text-[9px] font-black uppercase mt-1">Absent</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-32 text-center bg-white border-4 border-dashed border-slate-100 rounded-[3rem]">
                            <p className="text-slate-400 font-black uppercase tracking-widest">No Active Drivers Found</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <Table columns={[
                        { header: 'Date', accessor: 'date', render: (row) => <span className="font-bold text-slate-700">{new Date(row.date).toLocaleDateString()}</span> },
                        { header: 'Driver', accessor: 'full_name', render: (row) => <span className="font-black text-slate-900 uppercase">{row.full_name}</span> },
                        {
                            header: 'Status',
                            accessor: 'status',
                            render: (row) => (
                                <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${row.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${row.status === 'present' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                    {row.status}
                                </div>
                            )
                        },
                        { header: 'Notes', accessor: 'notes', render: (row) => <span className="text-slate-500 italic text-sm">{row.notes || '---'}</span> },
                        {
                            header: 'Actions',
                            accessor: 'actions',
                            render: (row) => (
                                <button
                                    onClick={() => {
                                        if (window.confirm('Delete this record?')) handleDeleteAttendance(row.id);
                                    }}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )
                        }
                    ]} data={records} />
                </div>
            )}

            {/* Manual Entry Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Manual Override">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Date</label>
                            <input
                                type="date"
                                required
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Driver</label>
                            <select
                                required
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold"
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

                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Status</label>
                        <div className="flex gap-4">
                            {['present', 'absent'].map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: s })}
                                    className={`flex-1 py-4 rounded-[2rem] font-black uppercase tracking-widest transition-all ${formData.status === s
                                        ? s === 'present' ? 'bg-green-600 text-white shadow-2xl shadow-green-200' : 'bg-red-600 text-white shadow-2xl shadow-red-200'
                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Notes</label>
                        <textarea
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold"
                            rows="4"
                            placeholder="REMARKS..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-8 py-4 rounded-[2rem] font-black text-slate-400 bg-slate-100 hover:bg-slate-200 transition-all uppercase tracking-widest text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-[2rem] font-black shadow-2xl shadow-indigo-200 transition-all uppercase tracking-widest text-sm"
                        >
                            Save Update
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AttendancePage;
