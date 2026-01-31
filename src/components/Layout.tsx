import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import NeuralButler from './ia/NeuralButler';

const Layout: React.FC = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-black font-sans text-slate-800 dark:text-slate-100 transition-all duration-300 flex flex-col relative overflow-hidden">
            {/* Background Decorative Wave / Glow */}
            <div className="fixed -top-32 -left-32 w-[900px] h-[700px] pointer-events-none opacity-[0.08] dark:opacity-[0.12] z-0 blur-[120px] rotate-12">
                <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-lime-500">
                    <path fill="currentColor" d="M0,0 L0,800 C150,700 400,900 650,800 C850,700 1000,900 1000,800 L1000,0 Z" />
                </svg>
            </div>

            <Navbar />
            <main className="flex-1 w-full max-w-[1600px] mx-auto pt-24 md:pt-32 pb-32 px-2 sm:px-4 md:px-10 overflow-x-hidden relative z-10">
                <Outlet />
            </main>
            <NeuralButler />
        </div>
    );
};

export default Layout;
