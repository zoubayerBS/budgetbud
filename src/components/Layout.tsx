import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col md:flex-row font-sans text-slate-800 dark:text-slate-100 transition-all duration-300">
            <Navbar />
            <main className="flex-1 pb-24 md:pb-0 md:p-8 overflow-y-auto h-screen scroll-smooth">
                <div className="max-w-4xl mx-auto p-4 md:p-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
