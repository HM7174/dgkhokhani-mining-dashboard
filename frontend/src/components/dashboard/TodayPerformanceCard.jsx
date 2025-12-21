import React from 'react';
import { Route, Clock, Droplets, ChevronRight, Info } from 'lucide-react';

const PerformanceItem = ({ icon: Icon, label, value, unit, iconBg, iconColor, showInfo = false }) => (
    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-all group cursor-pointer border border-transparent hover:border-slate-100">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>
                <Icon size={24} />
            </div>
            <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
                    {showInfo && <Info size={14} className="text-slate-400" />}
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">{value}</span>
                    {unit && <span className="text-sm font-bold text-slate-500">{unit}</span>}
                </div>
            </div>
        </div>
        <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
    </div>
);

const TodayPerformanceCard = ({ statistics }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-800">Today's Performance</h2>
                    <Info size={18} className="text-slate-400 cursor-pointer hover:text-slate-600" />
                </div>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View more</button>
            </div>
            <div className="space-y-4">
                <PerformanceItem
                    icon={Route}
                    label="Distance Travelled"
                    value={statistics?.total_distance || '-'}
                    unit="km"
                    iconBg="bg-rose-50"
                    iconColor="text-rose-500"
                />
                <PerformanceItem
                    icon={Clock}
                    label="Engine Hours Operated"
                    value="0"
                    unit="Hrs"
                    iconBg="bg-rose-50"
                    iconColor="text-rose-500"
                />
                <PerformanceItem
                    icon={Droplets}
                    label="Fuel Consumption"
                    value={statistics?.total_fuel_consumed || '0'}
                    unit="L"
                    iconBg="bg-rose-50"
                    iconColor="text-rose-500"
                    showInfo={true}
                />
            </div>
            <div className="mt-8 flex justify-center gap-2">
                <div className="w-6 h-1.5 rounded-full bg-rose-500 opacity-100" />
                <div className="w-1.5 h-1.5 rounded-full bg-rose-200" />
                <div className="w-1.5 h-1.5 rounded-full bg-rose-200" />
                <div className="w-1.5 h-1.5 rounded-full bg-rose-200" />
            </div>
        </div>
    );
};

export default TodayPerformanceCard;
