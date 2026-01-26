import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#eef2f6] dark:bg-[#0a0f18] font-sans text-slate-800 dark:text-slate-100 transition-all duration-300 flex flex-col">
            <Navbar />
            <main className="flex-1 w-full max-w-[1600px] mx-auto pt-24 md:pt-32 pb-32 px-4 md:px-10 overflow-x-hidden">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
