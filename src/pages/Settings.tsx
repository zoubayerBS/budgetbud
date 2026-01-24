import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import type { Currency, RecurringTemplate } from '../types';
import { Moon, Sun, Trash2, Globe, Check, LogOut, Repeat } from 'lucide-react';
import { signOut } from '../lib/auth-client';
import { cn } from '../lib/utils';
import { formatCurrency } from '../lib/format';
import AlertModal from '../components/common/AlertModal';

const Settings: React.FC = () => {
    const { theme, toggleTheme, currency, setCurrency, recurringTemplates, deleteRecurringTemplate } = useBudget();
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const currencies: Currency[] = ['EUR', 'USD', 'CHF', 'CAD', 'TND'];

    const handleReset = () => {
        // Feature disabled for now as it needs backend support
        setIsResetModalOpen(false);
        // alert('Cette fonctionnalité nécessite une mise à jour du serveur.');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 p-2 max-w-7xl mx-auto pb-12">
            <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Paramètres ⚙️</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">L'atelier de votre cockpit financier.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Theme Toggle */}
                <div className="clay-card p-8 flex flex-col justify-between group">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="p-5 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-3xl shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3">
                            {theme === 'light' ? <Sun className="w-8 h-8" /> : <Moon className="w-8 h-8" />}
                        </div>
                        <div>
                            <h3 className="font-black text-2xl text-slate-800 dark:text-white tracking-tight">Apparence</h3>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Mode {theme === 'light' ? 'Clair' : 'Sombre'} actif</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="clay-button-primary w-full py-5 rounded-2xl text-lg font-black shadow-xl shadow-indigo-500/20"
                    >
                        {theme === 'light' ? 'Activer le mode Sombre 🌙' : 'Activer le mode Clair ☀️'}
                    </button>
                </div>

                {/* Currency Selector */}
                <div className="clay-card p-8 group">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="p-5 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-3xl shadow-lg transition-transform group-hover:scale-110 group-hover:-rotate-3">
                            <Globe className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-black text-2xl text-slate-800 dark:text-white tracking-tight">Devise</h3>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Unité de mesure</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {currencies.map(c => (
                            <button
                                key={c}
                                onClick={() => setCurrency(c)}
                                className={cn(
                                    "p-5 rounded-2xl text-xl font-black flex items-center justify-center gap-3 transition-all",
                                    currency === c
                                        ? "clay-button bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                                        : "bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shadow-inner"
                                )}
                            >
                                {c}
                                {currency === c && <Check className="w-6 h-6" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Account Section */}
                <div className="clay-card p-8 border-none overflow-hidden relative group">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 blur-3xl rounded-full" />
                    <div className="flex items-center gap-6 mb-8">
                        <div className="p-5 bg-red-100 text-red-600 dark:bg-red-900/40 rounded-3xl shadow-inner group-hover:scale-110 transition-transform">
                            <LogOut className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-black text-2xl text-slate-800 dark:text-white tracking-tight">Compte</h3>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Gérer la session</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="w-full py-5 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-black text-lg hover:bg-red-100 transition-all active:scale-95 border border-red-100 dark:border-red-900/50"
                    >
                        Se déconnecter
                    </button>
                </div>

                {/* Danger Zone */}
                <div className="clay-card p-8 border-l-8 border-red-500 overflow-hidden relative group">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="p-5 bg-red-500 text-white rounded-3xl shadow-lg group-hover:scale-110 transition-transform">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-black text-2xl text-slate-800 dark:text-white tracking-tight">Laboratoire</h3>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Actions irréversibles</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsResetModalOpen(true)}
                        className="w-full py-5 rounded-2xl bg-white dark:bg-slate-900 text-slate-400 font-black text-lg hover:text-red-500 hover:bg-red-50 transition-all shadow-inner border border-slate-100 dark:border-slate-800"
                    >
                        Réinitialiser l'usine
                    </button>
                </div>

            </div>

            {/* Recurring Transactions Management */}
            <div className="mt-12 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500 text-white rounded-2xl">
                        <Repeat className="w-6 h-6" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Mes Automatisations</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recurringTemplates.length === 0 ? (
                        <div className="col-span-full clay-card p-12 text-center bg-slate-50 dark:bg-slate-900/40 shadow-inner">
                            <p className="text-slate-400 font-black uppercase tracking-widest">Aucune automatisation active</p>
                        </div>
                    ) : (
                        recurringTemplates.map((template: RecurringTemplate) => (
                            <div key={template.id} className="clay-card p-6 flex items-center justify-between group animate-in zoom-in-95">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                                        template.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                                    )}>
                                        <Repeat className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 dark:text-white leading-none">{template.category}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                            {template.frequency === 'monthly' ? 'Tous les mois' : template.frequency} • {formatCurrency(template.amount, currency)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteRecurringTemplate(template.id)}
                                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all"
                                    title="Arrêter l'automatisation"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="text-center text-[10px] font-black tracking-[0.2em] text-slate-300 dark:text-slate-600 mt-16 uppercase italic">
                <p>BudgetBud Framework • Automation Engine v1.2</p>
            </div>

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
