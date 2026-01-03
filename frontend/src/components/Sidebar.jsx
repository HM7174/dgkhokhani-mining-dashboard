import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';
import { LayoutDashboard, Truck, Users as DriversIcon, MapPin, Fuel, CalendarCheck, LogOut, ShieldAlert, UserCog, ChevronLeft, ChevronRight, X } from 'lucide-react';

const Sidebar = ({ isOpen, isCollapsed, onToggle, isMobile, onMobileClose }) => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const navItems = [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Trucks & Machines', path: '/trucks', icon: Truck },
        { label: 'Drivers', path: '/drivers', icon: DriversIcon },
        { label: 'Sites', path: '/sites', icon: MapPin },
        { label: 'Fuel Logs', path: '/fuel', icon: Fuel },
        { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
    ];

    if (user?.role === 'admin') {
        navItems.push({ label: 'Users', path: '/users', icon: UserCog });
        navItems.push({ label: 'Audit Logs', path: '/audit', icon: ShieldAlert });
    }

    const sidebarContent = (
        <div className={clsx(
            "h-screen bg-slate-900 text-white flex flex-col sidebar-transition shrink-0",
            isCollapsed && !isMobile ? "w-20" : "w-64",
            isMobile ? "fixed inset-y-0 left-0 z-50 shadow-2xl" : "relative"
        )}>
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                {(!isCollapsed || isMobile) && (
                    <div className="overflow-hidden">
                        <h1 className="text-xl font-bold text-blue-400 truncate">D.G.Khokhani</h1>
                        <p className="text-xs text-slate-400 mt-1">Dashboard</p>
                    </div>
                )}
                {isMobile ? (
                    <button onClick={onMobileClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
                        <X size={20} />
                    </button>
                ) : (
                    <button
                        onClick={onToggle}
                        className={clsx(
                            "p-1 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors",
                            isCollapsed && "mx-auto"
                        )}
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={isMobile ? onMobileClose : undefined}
                            className={clsx(
                                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                                isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                                isCollapsed && !isMobile ? 'justify-center space-x-0 px-2' : ''
                            )}
                            title={isCollapsed ? item.label : ''}
                        >
                            <Icon size={20} className="shrink-0" />
                            {(!isCollapsed || isMobile) && <span className="font-medium truncate">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-slate-800 space-y-4">
                <div className={clsx(
                    "flex items-center space-x-3 px-2",
                    isCollapsed && !isMobile && "justify-center space-x-0"
                )}>
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold shrink-0">
                        {user?.username?.[0]?.toUpperCase()}
                    </div>
                    {(!isCollapsed || isMobile) && (
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.username}</p>
                            <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={logout}
                    className={clsx(
                        "w-full flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg transition-all text-sm",
                        isCollapsed && !isMobile ? "justify-center px-0" : "px-4"
                    )}
                    title="Logout"
                >
                    <LogOut size={16} className="shrink-0" />
                    {(!isCollapsed || isMobile) && <span className="font-medium">Logout</span>}
                </button>
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <>
                {/* Backdrop */}
                {isOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm sidebar-transition"
                        onClick={onMobileClose}
                    />
                )}
                <div
                    className={clsx(
                        "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:hidden",
                        isOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    {sidebarContent}
                </div>
            </>
        );
    }

    return sidebarContent;
};

export default Sidebar;
