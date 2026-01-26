import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Plus, History, PiggyBank, Landmark, Settings, RefreshCw, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { useBudget } from '../context/BudgetContext';

const Navbar: React.FC = () => {
    const { refresh, loading, openAddModal } = useBudget();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Tableau' },
        { to: '/history', icon: History, label: 'Historique' },
        { to: '/budgets', icon: Landmark, label: 'Budgets' },
        { to: '/savings', icon: PiggyBank, label: 'Épargne' },
        { to: '/settings', icon: Settings, label: 'Réglages' },
    ];

    return (
        <>
            {/* --- Desktop Floating Capsule --- */}
            <header className={cn(
                "fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 hidden md:block w-fit px-2",
                scrolled ? "top-4 opacity-90 scale-95 hover:opacity-100 hover:scale-100" : "top-8"
            )}>
                <nav className="bg-white/85 dark:bg-slate-950/85 backdrop-blur-3xl border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] p-2 flex items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)] noise-texture translate-z-0">

                    {/* Brand Mark */}
                    <div className="flex items-center gap-3 pl-4 pr-6 border-r border-slate-200/50 dark:border-slate-800/50">
                        <div className="w-9 h-9 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-500">
                            <Zap className="w-5 h-5 text-white dark:text-slate-900 fill-current" />
                        </div>
                        <span className="font-black text-sm tracking-tighter dark:text-white">BudgetBud</span>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex items-center gap-1 px-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.to;
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={cn(
                                        "relative flex items-center gap-2.5 px-5 py-3 rounded-full transition-all duration-500 group overflow-hidden",
                                        isActive
                                            ? "text-slate-900 dark:text-white"
                                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute inset-0 bg-white dark:bg-slate-800 shadow-sm animate-in zoom-in duration-500 rounded-full"></div>
                                    )}
                                    <Icon className={cn("w-4.5 h-4.5 relative z-10 transition-transform duration-500 group-hover:scale-110", isActive && "text-indigo-500")} />
                                    <span className="text-xs font-black relative z-10 uppercase tracking-widest">{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </div>

                    {/* Actions Group */}
                    <div className="flex items-center gap-2 pl-4 pr-2 border-l border-slate-200/50 dark:border-slate-800/50">
                        <button
                            onClick={() => refresh()}
                            className={cn(
                                "p-3 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-400 hover:text-indigo-500",
                                loading && "animate-spin text-indigo-500"
                            )}
                        >
                            <RefreshCw className="w-4.5 h-4.5" />
                        </button>
                        <button
                            onClick={openAddModal}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Ajouter</span>
                        </button>
                    </div>
                </nav>
            </header>

            {/* --- Mobile Floating Dock (Now Collapsible) --- */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] md:hidden w-fit max-w-[95vw]">
                <nav className={cn(
                    "bg-white/90 dark:bg-slate-950/90 backdrop-blur-3xl border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] p-2 flex items-center shadow-2xl noise-texture transition-all duration-500 ease-out gap-1",
                    isOpen ? "px-3" : "px-2"
                )}>
                    {/* Trigger Button (Left) */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                            isOpen ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rotate-90" : "text-slate-400"
                        )}
                    >
                        <Zap className={cn("w-5 h-5", isOpen && "fill-indigo-500 text-indigo-500")} />
                    </button>

                    {/* Nav Items (Animated width/opacity) */}
                    <div className={cn(
                        "flex items-center gap-1 overflow-hidden transition-all duration-700 ease-in-out",
                        isOpen ? "max-w-[400px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"
                    )}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.to;
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "p-4 rounded-full transition-all duration-500",
                                        isActive ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg" : "text-slate-500"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                </NavLink>
                            );
                        })}
                    </div>

                    {/* Add Button (Always visible on the right) */}
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            openAddModal();
                        }}
                        className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform ml-1 shrink-0"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </nav>
            </div>
        </>
    );
};

export default Navbar;
