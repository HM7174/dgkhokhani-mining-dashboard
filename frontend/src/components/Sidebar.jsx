import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, MapPin, Fuel, CalendarCheck, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const navItems = [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Trucks & Machines', path: '/trucks', icon: Truck },
        { label: 'Drivers', path: '/drivers', icon: Users },
        { label: 'Sites', path: '/sites', icon: MapPin },
        { label: 'Fuel Logs', path: '/fuel', icon: Fuel },
        { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
    ];

    if (user?.role === 'admin') {
        navItems.push({ label: 'Audit Logs', path: '/audit', icon: ShieldAlert });
    }

    return (
        <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold text-blue-400">D.G.Khokhani</h1>
                <p className="text-xs text-slate-400 mt-1">Dashboard</p>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                                isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            )}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center space-x-3 mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                        {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{user?.username}</p>
                        <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg transition-colors text-sm"
                >
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
