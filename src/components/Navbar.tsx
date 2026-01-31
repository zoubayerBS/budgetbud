import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Plus, History, PiggyBank, Landmark, Settings, RefreshCw, Zap, BrainCircuit } from 'lucide-react';
import { cn } from '../lib/utils';
import { useBudget } from '../context/BudgetContext';
import { useLanguage } from '../context/LanguageContext';
import { Moon, Sun } from 'lucide-react';

const Navbar: React.FC = () => {
    const { refresh, loading, openAddModal, theme, toggleTheme } = useBudget();
    const { t } = useLanguage();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [aiStatus, setAiStatus] = useState<'live' | 'offline' | 'loading'>('loading');

    useEffect(() => {
        const checkAIStatus = async () => {
            try {
                const res = await fetch('/api/ai/status');
                const data = await res.json();
                setAiStatus(data.status);
            } catch (err) {
                setAiStatus('offline');
            }
        };
        checkAIStatus();
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: t('dashboard') },
        { to: '/history', icon: History, label: t('history') },
        { to: '/budgets', icon: Landmark, label: t('budgets') },
        { to: '/savings', icon: PiggyBank, label: t('savings') },
        { to: '/advisor', icon: BrainCircuit, label: t('advisor') },
        { to: '/settings', icon: Settings, label: t('settings') },
    ];

    return (
        <>
            {/* --- Desktop Floating Capsule --- */}
            <header className={cn(
                "fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 hidden md:block w-fit px-2",
                scrolled ? "top-4 opacity-90 scale-95 hover:opacity-100 hover:scale-100" : "top-8"
            )}>
                <nav className="bg-white dark:bg-black backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-2 flex items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] noise-texture translate-z-0">

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
                                        <div className="absolute inset-0 bg-white dark:bg-white/5 shadow-inner animate-in zoom-in duration-500 rounded-full border border-slate-100 dark:border-white/5"></div>
                                    )}
                                    <Icon className={cn("w-4.5 h-4.5 relative z-10 transition-transform duration-500 group-hover:scale-110", isActive && "text-lime-500")} />
                                    <span className="text-xs font-black relative z-10 uppercase tracking-widest flex items-center gap-1.5">
                                        {item.label}
                                        {item.label === 'IA' && (
                                            <span className="relative flex h-2 w-2">
                                                {aiStatus === 'live' && (
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                                                )}
                                                <span className={cn(
                                                    "relative inline-flex rounded-full h-2 w-2",
                                                    aiStatus === 'live' ? "bg-lime-500" : aiStatus === 'offline' ? "bg-red-500" : "bg-slate-400"
                                                )}></span>
                                            </span>
                                        )}
                                        {item.label === 'IA' && (
                                            <span className={cn(
                                                "text-[8px] font-black uppercase tracking-widest leading-none bg-white dark:bg-white/5/50 px-1.5 py-0.5 rounded-sm shadow-sm",
                                                aiStatus === 'live' ? "text-lime-600 dark:text-lime-400" : aiStatus === 'offline' ? "text-red-500" : "text-slate-400"
                                            )}>
                                                {aiStatus === 'live' ? 'On' : aiStatus === 'offline' ? 'Off' : '...'}
                                            </span>
                                        )}
                                    </span>
                                </NavLink>
                            );
                        })}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2 pl-4 pr-2 border-l border-slate-200/50 dark:border-slate-800/50">
                        {/* Neural Status Pill */}
                        <div className={cn(
                            "hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-colors",
                            aiStatus === 'live'
                                ? "bg-lime-500/10 border-lime-500/20 text-lime-600 dark:text-lime-400"
                                : "bg-white dark:bg-white/5 border-transparent text-slate-400"
                        )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", aiStatus === 'live' ? "bg-lime-500 animate-pulse" : "bg-slate-400")} />
                            {aiStatus === 'live' ? t('online') : t('offline')}
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 hover:text-yellow-600 border border-transparent hover:border-yellow-200/50 transition-colors relative overflow-hidden group"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>

                        <button
                            onClick={() => refresh()}
                            className={cn(
                                "p-3 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-400 hover:text-lime-500",
                                loading && "animate-spin text-lime-500"
                            )}
                        >
                            <RefreshCw className="w-4.5 h-4.5" />
                        </button>
                    </div>
                </nav>
            </header>

            {/* --- Mobile Floating Dock (Now Collapsible) --- */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] md:hidden w-fit max-w-[95vw]">
                <nav className={cn(
                    "bg-white/90 dark:bg-black/90 backdrop-blur-3xl border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] p-2 flex items-center shadow-2xl noise-texture transition-all duration-500 ease-out gap-1",
                    isOpen ? "px-3" : "px-2"
                )}>
                    {/* Trigger Button (Left) */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                            isOpen ? "bg-white dark:bg-white/5 text-slate-900 dark:text-white rotate-90" : "text-slate-400"
                        )}
                    >
                        <Zap className={cn("w-5 h-5", isOpen && "fill-lime-500 text-lime-500")} />
                    </button>

                    {/* Nav Items (Animated width/opacity) */}
                    <div className={cn(
                        "flex items-center gap-1 overflow-x-auto scrollbar-hide transition-all duration-700 ease-in-out",
                        isOpen ? "max-w-[70vw] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"
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
                                        "p-4 rounded-full transition-all duration-500 relative flex flex-col items-center gap-1",
                                        isActive ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg" : "text-slate-500"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label === 'IA' && (
                                        <>
                                            <span className="absolute top-3 right-3 flex h-2 w-2">
                                                {aiStatus === 'live' && (
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                                                )}
                                                <span className={cn(
                                                    "relative inline-flex rounded-full h-2 w-2",
                                                    aiStatus === 'live' ? "bg-lime-500" : aiStatus === 'offline' ? "bg-red-500" : "bg-slate-400"
                                                )}></span>
                                            </span>
                                            <span className={cn(
                                                "text-[7px] font-black uppercase tracking-widest leading-none",
                                                aiStatus === 'live' ? (isActive ? "text-lime-400" : "text-lime-500") : "text-red-500"
                                            )}>
                                                {aiStatus === 'live' ? 'ON' : aiStatus === 'offline' ? 'OFF' : '...'}
                                            </span>
                                        </>
                                    )}
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
                        className="w-12 h-12 bg-lime-600 rounded-full flex items-center justify-center text-black shadow-lg active:scale-90 transition-transform ml-1 shrink-0"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </nav>
            </div>
        </>
    );
};

export default Navbar;
