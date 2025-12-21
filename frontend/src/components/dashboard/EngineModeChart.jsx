import React from 'react';

const EngineModeChart = () => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full bg-no-repeat bg-center" style={{ minHeight: '300px' }}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Engine Mode Utilization</h2>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View more</button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <div className="w-24 h-24 mb-4 opacity-20 bg-slate-200 rounded-full flex items-center justify-center">
                    <span className="text-4xl text-slate-400">?</span>
                </div>
                <p className="text-lg font-bold text-slate-400">No Data Found.</p>
            </div>
        </div>
    );
};

export default EngineModeChart;
