import React from 'react';

const ServiceStatusChart = () => {
    // Mock data for the pie chart as seen in the image (40% pink)
    const percentage = 40;
    const strokeDasharray = `${percentage} ${100 - percentage}`;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800">Service Status</h2>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View more</button>
            </div>
            <div className="flex-1 flex items-center justify-center relative">
                <div className="w-48 h-48 relative">
                    <svg viewBox="0 0 32 32" className="w-full h-full transform -rotate-90">
                        <circle
                            cx="16"
                            cy="16"
                            r="16"
                            fill="#A78BFA" // Purple color from image
                        />
                        <circle
                            cx="16"
                            cy="16"
                            r="16"
                            fill="transparent"
                            stroke="#F472B6" // Pink color from image
                            strokeWidth="32"
                            strokeDasharray={strokeDasharray}
                            pathLength="100"
                        />
                    </svg>
                    <div className="absolute inset-x-0 bottom-4 flex justify-center">
                        <span className="text-sm font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded shadow-sm">40.00%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceStatusChart;
