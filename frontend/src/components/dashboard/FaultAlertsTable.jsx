import React from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const FaultAlertsTable = () => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800">Fault Alerts</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search By Reg. No./Vin. No."
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                    />
                    <Search size={18} className="absolute left-3 top-2.5 text-blue-500" />
                </div>
            </div>

            <div className="flex gap-6 mb-4 border-b border-slate-100">
                <button className="pb-2 text-sm font-bold text-amber-500 border-b-2 border-amber-500">
                    Critical(0)
                </button>
                <button className="pb-2 text-sm font-bold text-slate-400">
                    Warning(0)
                </button>
            </div>

            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <th className="pb-4">Reg No.</th>
                            <th className="pb-4">Issue</th>
                            <th className="pb-4">Suggested Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="3" className="py-20 text-center text-slate-400 font-medium">
                                No data found.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center justify-center gap-6">
                <button className="p-1 rounded-full border border-slate-200 text-blue-500 hover:bg-slate-50">
                    <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-bold text-slate-700">1</span>
                <button className="p-1 rounded-full border border-slate-200 text-blue-500 hover:bg-slate-50">
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default FaultAlertsTable;
