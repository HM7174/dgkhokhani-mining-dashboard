import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu } from 'lucide-react';
import clsx from 'clsx';

const Layout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) setIsMobileMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex">
                <Sidebar
                    isCollapsed={isCollapsed}
                    onToggle={() => setIsCollapsed(!isCollapsed)}
                    isMobile={false}
                />
            </div>

            {/* Mobile Sidebar */}
            <div className="lg:hidden">
                <Sidebar
                    isOpen={isMobileMenuOpen}
                    onMobileClose={() => setIsMobileMenuOpen(false)}
                    isMobile={true}
                />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header for Mobile */}
                <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 sticky top-0 z-30">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 text-slate-600 hover:text-blue-600 transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="ml-4">
                        <h2 className="text-lg font-bold text-slate-800">D.G.Khokhani</h2>
                    </div>
                </header>

                <main className={clsx(
                    "flex-1 p-4 md:p-8 overflow-y-auto max-w-full",
                    !isMobile && "content-transition"
                )}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
