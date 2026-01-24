import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Plus, History, PiggyBank, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

const Navbar: React.FC = () => {
    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Tableau' },
        { to: '/history', icon: History, label: 'Hist.' },
        { to: '/add', icon: Plus, label: '', isFab: true }, // FAB in middle
        { to: '/budgets', icon: PiggyBank, label: 'Budgets' },
        { to: '/settings', icon: Settings, label: 'Param.' },
    ];

    return (
        <nav className="fixed bottom-6 left-6 right-6 md:static md:w-auto md:h-screen z-40 animate-in slide-in-from-bottom-6 duration-700">

            {/* Desktop Container */}
            <div className="hidden md:flex flex-col w-72 h-[95vh] my-auto ml-6 clay-card p-6 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl z-40 ring-1 ring-slate-200/50 dark:ring-slate-900/50">
                <div className="flex items-center gap-4 mb-10 px-2 mt-2">
                    <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
                        <span className="font-extrabold text-2xl">B</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-none">BudgetBud</h1>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Finance</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {navItems.filter(i => !i.isFab).map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 font-bold text-sm group border border-transparent",
                                    isActive
                                        ? "bg-white/60 dark:bg-slate-900/60 shadow-inner text-blue-600 dark:text-blue-400 translate-y-[1px] border-slate-200/50 dark:border-slate-800"
                                        : "text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40 hover:text-slate-700 dark:hover:text-slate-200 hover:-translate-y-1"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </div>

                <div className="mt-auto">
                    <NavLink
                        to="/add"
                        className="clay-button-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all z-10"
                    >
                        <Plus className="w-6 h-6" />
                        <span className="font-bold">Nouvelle Transaction</span>
                    </NavLink>
                </div>
            </div>

            {/* Mobile Dock */}
            <div className="md:hidden clay-card h-20 px-6 flex items-center justify-between bg-white dark:bg-slate-800 shadow-2xl border border-slate-200/50 dark:border-slate-700/50 ring-1 ring-slate-200/50 dark:ring-slate-900/50">
                {navItems.map((item) => {
                    const Icon = item.icon;

                    if (item.isFab) {
                        return (
                            <div key="fab-container" className="relative -top-8 z-50">
                                <NavLink
                                    to={item.to}
                                    className={({ isActive }) => cn(
                                        "w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-transform duration-300 border-[6px] border-[#eef2f6] dark:border-[#111827]",
                                        isActive
                                            ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white scale-110 shadow-blue-500/50"
                                            : "bg-gradient-to-tr from-blue-500 to-indigo-500 text-white hover:scale-105"
                                    )}
                                >
                                    <Plus className="w-8 h-8" />
                                </NavLink>
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => cn(
                                "flex flex-col items-center gap-1 transition-all duration-300",
                                isActive
                                    ? "text-blue-600 dark:text-blue-400 scale-110"
                                    : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                            )}
                        >
                            {({ isActive }) => (
                                <div className={cn(
                                    "p-2 rounded-xl transition-all",
                                    isActive && "bg-white/60 dark:bg-blue-900/20 shadow-inner ring-1 ring-blue-100 dark:ring-blue-900/30"
                                )}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            )}
                        </NavLink>
                    );
                })}
            </div>

        </nav>
    );
};

export default Navbar;
