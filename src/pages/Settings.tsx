import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import type { Currency, RecurringTemplate } from '../types';
import {
    Moon,
    Sun,
    Trash2,
    Globe,
    Check,
    LogOut,
    Repeat,
    User,
    ShieldCheck,
    Zap,
    Activity,
    CreditCard,
    Cpu,
    Database
} from 'lucide-react';
import { cn } from '../lib/utils';
import { formatCurrency } from '../lib/format';
import AlertModal from '../components/common/AlertModal';
import { signOut } from '../lib/auth-client';

const Settings: React.FC = () => {
    const {
        theme,
        toggleTheme,
        currency,
        setCurrency,
        recurringTemplates,
        deleteRecurringTemplate,
        transactions,
        budgets,
        user
    } = useBudget();
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const currencies: Currency[] = ['EUR', 'USD', 'CHF', 'CAD', 'TND'];

    const handleReset = () => {
        // Feature disabled for now as it needs backend support
        console.log("Reset project triggered");
    };

    const stats = [
        { label: 'Transactions', value: transactions.length, icon: Activity, color: 'text-blue-500' },
        { label: 'Budgets Actifs', value: budgets.length, icon: CreditCard, color: 'text-emerald-500' },
        { label: 'Automatisations', value: recurringTemplates.length, icon: Zap, color: 'text-amber-500' },
    ];

    const handleSignOut = async () => {
        try {
            console.log('[LOGOUT] Triggering Neon Auth signOut...');
            // We use signOut from better-auth
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        console.log('[LOGOUT] Redirecting to login...');
                        // Clear local storage as a safety measure
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.href = '/login';
                    },
                    onError: (ctx) => {
                        console.error('[LOGOUT] Sign out request failed:', ctx.error);
                        // Fallback: Clear local and redirect anyway
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.href = '/login';
                    }
                }
            });
        } catch (err) {
            console.error('[LOGOUT] Unexpected error:', err);
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/login';
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4">

            {/* 1. Profile Cockpit Header */}
            <header className="relative mt-4">
                <div className="clay-card p-10 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-blue-600 dark:to-indigo-700 text-white overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center border border-white/20 shadow-2xl backdrop-blur-xl">
                            <User className="w-12 h-12 text-blue-200" />
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h2 className="text-4xl font-black tracking-tight mb-2">
                                {user?.name || 'Commandant Budget'} 🛡️
                            </h2>
                            <p className="text-blue-100/60 font-bold uppercase tracking-[0.2em] text-xs">
                                Gestionnaire de niveau 4 • {user?.email}
                            </p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all active:scale-95"
                        >
                            <LogOut className="w-4 h-4" /> Déconnexion
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-10 pt-10 border-t border-white/10">
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center md:text-left">
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                    <span className="text-xl font-black">{stat.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. Display Pod */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="clay-card p-8 flex flex-col h-full bg-white dark:bg-slate-800">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">Affichage</h3>
                        </div>

                        <div className="space-y-4 flex-1">
                            <button
                                onClick={() => theme === 'dark' && toggleTheme()}
                                className={cn(
                                    "w-full p-6 rounded-3xl flex items-center justify-between transition-all group",
                                    theme === 'light'
                                        ? "bg-blue-50 text-blue-600 shadow-inner"
                                        : "bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <Sun className="w-6 h-6" />
                                    <span className="font-black text-lg">Mode Clair</span>
                                </div>
                                {theme === 'light' && <Check className="w-6 h-6" />}
                            </button>

                            <button
                                onClick={() => theme === 'light' && toggleTheme()}
                                className={cn(
                                    "w-full p-6 rounded-3xl flex items-center justify-between transition-all group",
                                    theme === 'dark'
                                        ? "bg-blue-500 text-white shadow-xl shadow-blue-500/40"
                                        : "bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-200"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <Moon className="w-6 h-6" />
                                    <span className="font-black text-lg">Mode Sombre</span>
                                </div>
                                {theme === 'dark' && <Check className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Regional Hub */}
                <div className="lg:col-span-1">
                    <div className="clay-card p-8 flex flex-col h-full bg-white dark:bg-slate-800">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">Régional</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {currencies.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setCurrency(c)}
                                    className={cn(
                                        "p-4 rounded-2xl font-black text-sm transition-all shadow-sm border-2",
                                        currency === c
                                            ? "bg-emerald-500 text-white border-emerald-400 shadow-lg scale-105"
                                            : "bg-slate-50 dark:bg-slate-900 text-slate-400 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                    )}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                        <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center italic leading-relaxed">
                            Les taux de change sont synchronisés via Neon Hub.
                        </p>
                    </div>
                </div>

                {/* 4. Support & Security */}
                <div className="lg:col-span-1">
                    <div className="clay-card p-8 flex flex-col h-full bg-white dark:bg-slate-800">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-red-500 text-white rounded-2xl shadow-lg">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">Laboratoire</h3>
                        </div>

                        <div className="space-y-4 flex-1">
                            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border-l-4 border-red-500">
                                <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Zone de Danger</p>
                                <p className="text-xs font-bold text-red-800 dark:text-red-200 mt-1">Les actions ici sont définitives.</p>
                            </div>

                            <button
                                onClick={() => setIsResetModalOpen(true)}
                                className="w-full py-5 rounded-3xl bg-slate-50 dark:bg-slate-900 text-red-500 font-black text-lg hover:bg-red-500 hover:text-white transition-all shadow-inner border border-transparent hover:border-red-200 group"
                            >
                                <Trash2 className="w-6 h-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] uppercase tracking-widest block">Réinitialiser l'Usine</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Automation Lab Redesign */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-amber-500 text-white rounded-[2rem] shadow-lg shadow-amber-500/30">
                            <Repeat className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none">Automation Lab</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Neural Link v1.2 Enabled</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recurringTemplates.length === 0 ? (
                        <div className="col-span-full clay-card p-16 text-center bg-slate-50 dark:bg-slate-900/40 border-slate-200/50 border-dashed border-2 shadow-inner">
                            <Repeat className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                            <p className="text-slate-400 font-black uppercase tracking-[0.3em]">Aucune règle active</p>
                        </div>
                    ) : (
                        recurringTemplates.map((template: RecurringTemplate) => (
                            <div key={template.id} className="clay-card p-8 group relative overflow-hidden transition-all hover:-translate-y-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
                                <div className={cn(
                                    "absolute top-0 right-0 w-32 h-32 opacity-10 -mr-10 -mt-10 rounded-full",
                                    template.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'
                                )}></div>

                                <div className="flex items-center justify-between mb-8">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                                        template.type === 'income' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                    )}>
                                        <Repeat className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <button
                                        onClick={() => deleteRecurringTemplate(template.id)}
                                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-2xl transition-all shadow-inner border border-transparent hover:border-red-200"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <h4 className="font-black text-2xl text-slate-800 dark:text-white mb-2 leading-none uppercase tracking-tight">{template.category}</h4>
                                <p className="text-4xl font-black text-slate-700 dark:text-slate-200 tracking-tighter mb-6">
                                    {formatCurrency(template.amount, currency)}
                                </p>

                                <div className="flex items-center gap-2">
                                    <div className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">
                                        Frequence: {template.frequency}
                                    </div>
                                    <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 leading-none">
                                        Actif 💎
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* 6. System Health Footer */}
            <footer className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-12 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4 text-slate-400 group">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <Database className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Database</p>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-200">Neon Serverless • OK</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-slate-400 group">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <Cpu className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Engine</p>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-200">Vite React SW • v4.2</p>
                    </div>
                </div>
                <div className="md:col-span-2 text-center md:text-right self-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic leading-relaxed">
                        BudgetBud Framework • High-End Financial Cockpit • © 2026
                    </p>
                </div>
            </footer>

            <AlertModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={handleReset}
                title="Alerte Maximale ! 🔥"
                message="Toutes vos transactions et budgets seront effacés définitivement du serveur Neon. Cette action est irréversible."
                type="error"
                confirmText="Tout détruire"
                cancelText="Ouf, annuler"
            />
        </div>
    );
};

export default Settings;
