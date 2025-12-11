import React from 'react';
import { Truck, PenTool as Tool, Navigation, AlertCircle } from 'lucide-react';

const TruckCard = ({ vehicle, onClick }) => {
    const isTruck = vehicle.type === 'truck';
    const StatusIcon = vehicle.status === 'active' ? Truck : AlertCircle;

    return (
        <div
            onClick={() => onClick(vehicle)}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 group relative overflow-hidden"
        >
            {/* Top Indicator Strip */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${vehicle.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                }`} />

            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${isTruck ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                    {isTruck ? <Truck size={24} /> : <Tool size={24} />}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${vehicle.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                    {vehicle.status}
                </span>
            </div>

            {/* Registration Plate Style Display */}
            <div className="mb-4 text-center">
                <div className="inline-block border-2 border-slate-800 rounded px-4 py-1 bg-yellow-300 text-slate-900 font-mono font-bold text-xl shadow-sm tracking-widest">
                    {vehicle.registration_number || 'NO PLATE'}
                </div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-1 truncate">
                {vehicle.name}
            </h3>

            <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center space-x-2">
                    <Navigation size={14} />
                    <span className="truncate">
                        {vehicle.site_name || 'Unassigned Site'}
                    </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-3">
                    <span>Total Distance</span>
                    <span className="font-semibold text-slate-700">{vehicle.total_km || 0} km</span>
                </div>
            </div>

            {/* Hover Action Hint */}
            <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                <span className="bg-white/90 text-blue-600 px-3 py-1 rounded-full text-xs font-medium shadow-sm border border-blue-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                    View Details
                </span>
            </div>
        </div>
    );
};

export default TruckCard;
