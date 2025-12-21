import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Clock, X } from 'lucide-react';

/**
 * Real-time alerts panel with animations
 */
const AlertsPanel = ({ alerts = [], isLoading }) => {
    const [dismissedAlerts, setDismissedAlerts] = React.useState([]);

    const getSeverityConfig = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'high':
            case 'critical':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    icon: AlertTriangle,
                    iconColor: 'text-red-600',
                    textColor: 'text-red-800',
                    titleColor: 'text-red-900'
                };
            case 'medium':
            case 'warning':
                return {
                    bg: 'bg-amber-50',
                    border: 'border-amber-200',
                    icon: AlertCircle,
                    iconColor: 'text-amber-600',
                    textColor: 'text-amber-800',
                    titleColor: 'text-amber-900'
                };
            default:
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    icon: AlertCircle,
                    iconColor: 'text-blue-600',
                    textColor: 'text-blue-800',
                    titleColor: 'text-blue-900'
                };
        }
    };

    const getTimeAgo = (timestamp) => {
        if (!timestamp) return 'Just now';
        const now = new Date();
        const alertTime = new Date(timestamp);
        const diffMinutes = Math.floor((now - alertTime) / 1000 / 60);

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
        return `${Math.floor(diffMinutes / 1440)}d ago`;
    };

    const handleDismiss = (alertId) => {
        setDismissedAlerts(prev => [...prev, alertId]);
    };

    const activeAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id));

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <AlertTriangle size={20} className="text-red-500" />
                    Real-Time Alerts
                </h2>
                {activeAlerts.length > 0 && (
                    <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        {activeAlerts.length}
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {isLoading ? (
                    // Loading skeleton
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-xl animate-pulse">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-slate-200 rounded w-1/2" />
                        </div>
                    ))
                ) : activeAlerts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center h-full text-center py-8"
                    >
                        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-3">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-slate-600">All Clear!</p>
                        <p className="text-xs text-slate-400 mt-1">No active alerts at the moment</p>
                    </motion.div>
                ) : (
                    <AnimatePresence>
                        {activeAlerts.map((alert, index) => {
                            const config = getSeverityConfig(alert.severity);
                            const Icon = config.icon;

                            return (
                                <motion.div
                                    key={alert.id || index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className={`relative flex items-start gap-3 p-4 ${config.bg} border ${config.border} rounded-xl hover:shadow-md transition-shadow duration-200`}
                                >
                                    <Icon size={20} className={`${config.iconColor} mt-0.5 flex-shrink-0`} />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm font-semibold ${config.titleColor}`}>
                                                {alert.type || 'Alert'}
                                            </p>
                                            <button
                                                onClick={() => handleDismiss(alert.id)}
                                                className={`${config.iconColor} hover:opacity-70 transition-opacity`}
                                                aria-label="Dismiss alert"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                        <p className={`text-xs ${config.textColor} mt-1 leading-relaxed`}>
                                            {alert.message}
                                        </p>
                                        {alert.vehicle_id && (
                                            <p className={`text-xs ${config.textColor} opacity-70 mt-1`}>
                                                Vehicle: {alert.vehicle_id}
                                            </p>
                                        )}
                                        <div className={`flex items-center gap-1 text-xs ${config.textColor} opacity-60 mt-2`}>
                                            <Clock size={10} />
                                            <span>{getTimeAgo(alert.timestamp)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default AlertsPanel;
