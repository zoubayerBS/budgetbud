import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import type { Currency, RecurringTemplate } from '../types';
import {
    Moon,
    Sun,
    Trash2,
    Check,
    LogOut,
    Repeat,
    User,
    ShieldCheck,
    Zap
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
        user,
        resetAccount
    } = useBudget();
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const currencies: Currency[] = ['EUR', 'USD', 'CHF', 'CAD', 'TND'];

    const handleReset = async () => {
        await resetAccount();
        setIsResetModalOpen(false);
    };

    const handleSignOut = async () => {
        try {
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.href = '/login';
                    },
                    onError: (ctx) => {
                        console.error('[LOGOUT] Error:', ctx.error.message);
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.href = '/login';
                    }
                }
            });
        } catch {
            console.error('[LOGOUT] Unexpected error');
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/login';
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-6 space-y-12 animate-in fade-in duration-700">
            {/* --- Executive Header --- */}
            <header className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 pb-12 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl executive-card flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm">
                        <User className="w-10 h-10 text-slate-400" />
                    </div>
                    <div className="space-y-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Compte Personnel
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                            {user?.name || 'Utilisateur'} • {user?.email}
                        </p>
                    </div>
                </div>
                <div className="flex-shrink-0 w-full md:w-auto flex justify-center">
                    <button
                        onClick={handleSignOut}
                        className="clay-button-secondary text-sm px-6 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-colors w-fit"
                    >
                        <LogOut className="w-4 h-4" />
                        Se déconnecter
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* --- Preferences Section --- */}
                <section className="space-y-8">
                    <div>
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Préférences</h2>
                        <div className="executive-card p-2 space-y-1">
                            <button
                                onClick={() => theme === 'dark' && toggleTheme()}
                                className={cn(
                                    "w-full p-4 rounded-2xl flex items-center justify-between transition-all",
                                    theme === 'light' ? "bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Sun className={cn("w-5 h-5", theme === 'light' ? "text-amber-500" : "text-slate-400")} />
                                    <span className={cn("text-sm font-semibold", theme === 'light' ? "text-slate-900 dark:text-white" : "text-slate-500")}>Mode Clair</span>
                                </div>
                                {theme === 'light' && <Check className="w-4 h-4 text-indigo-600" />}
                            </button>
                            <button
                                onClick={() => theme === 'light' && toggleTheme()}
                                className={cn(
                                    "w-full p-4 rounded-2xl flex items-center justify-between transition-all",
                                    theme === 'dark' ? "bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Moon className={cn("w-5 h-5", theme === 'dark' ? "text-indigo-400" : "text-slate-400")} />
                                    <span className={cn("text-sm font-semibold", theme === 'dark' ? "text-slate-900 dark:text-white" : "text-slate-500")}>Mode Sombre</span>
                                </div>
                                {theme === 'dark' && <Check className="w-4 h-4 text-indigo-400" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Unité Monétaire</h2>
                        <div className="grid grid-cols-5 gap-2">
                            {currencies.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setCurrency(c)}
                                    className={cn(
                                        "py-3 rounded-xl text-xs font-bold transition-all border",
                                        currency === c
                                            ? "bg-white dark:bg-slate-800 border-indigo-500 text-indigo-600 shadow-sm"
                                            : "bg-slate-50 dark:bg-slate-900/50 border-transparent text-slate-400 hover:border-slate-200"
                                    )}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- Automation Section --- */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between uppercase tracking-[0.2em]">
                        <h2 className="text-xs font-bold text-slate-400 whitespace-nowrap">Automatisations</h2>
                        <span className="h-px bg-slate-100 dark:bg-slate-800 w-full ml-4"></span>
                    </div>

                    <div className="space-y-3">
                        {recurringTemplates.length === 0 ? (
                            <div className="p-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] flex flex-col items-center gap-4">
                                <Zap className="w-8 h-8 text-slate-200" />
                                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Aucune règle active</p>
                            </div>
                        ) : (
                            recurringTemplates.map((template: RecurringTemplate) => (
                                <div key={template.id} className="executive-card p-5 group flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center",
                                            template.type === 'income' ? 'bg-emerald-50/50 text-emerald-600' : 'bg-red-50/50 text-red-600'
                                        )}>
                                            <Repeat className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-slate-800 dark:text-zinc-100 text-sm font-bold">{template.category}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{template.frequency}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <span className="text-sm font-black text-slate-900 dark:text-white">
                                            {formatCurrency(template.amount, currency)}
                                        </span>
                                        <button
                                            onClick={() => deleteRecurringTemplate(template.id)}
                                            className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 hover:text-red-500 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* --- Data Management --- */}
            <footer className="pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-4 text-slate-400">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs font-semibold tracking-wider italic">Infrastructure Neon Cloud • v2.4.0</span>
                </div>

                <button
                    onClick={() => setIsResetModalOpen(true)}
                    className="text-[10px] font-black text-red-500 hover:text-red-600 uppercase tracking-[0.3em] flex items-center gap-2 group transition-all"
                >
                    <Trash2 className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                    Réinitialiser les données
                </button>
            </footer>

            <AlertModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={handleReset}
                title="Suppression Définitive"
                message="Cette action effacera l'ensemble de vos transactions et budgets stockés sur le serveur. Voulez-vous continuer ?"
                type="error"
                confirmText="Confirmer la suppression"
                cancelText="Annuler"
            />
        </div>
    );
};

export default Settings;
