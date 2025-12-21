import React from 'react';
import { motion } from 'framer-motion';

/**
 * Premium KPI Card with real-time data animations
 */
const KPICard = ({ title, value, icon: Icon, gradient, subtext, isLoading }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative bg-white p-6 rounded-2xl shadow-lg border border-slate-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
        >
            {/* Animated gradient background on hover */}
            <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

            <div className="relative z-10 flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>

                    {isLoading ? (
                        <div className="mt-2 h-8 w-24 bg-slate-200 animate-pulse rounded" />
                    ) : (
                        <motion.p
                            key={value}
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-3xl font-bold text-slate-900 mt-1"
                        >
                            {value}
                        </motion.p>
                    )}

                    {subtext && (
                        <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            {subtext}
                        </p>
                    )}
                </div>

                <div className={`p-4 rounded-2xl ${gradient} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={28} className="text-white" />
                </div>
            </div>

            {/* Live indicator */}
            <div className="absolute top-2 right-2">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-medium text-green-700">LIVE</span>
                </div>
            </div>
        </motion.div>
    );
};

export default KPICard;
