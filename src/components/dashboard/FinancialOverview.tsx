import React, { useMemo } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../lib/format';
import { TrendingUp, TrendingDown, Plus, ArrowRight, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

const FinancialOverview: React.FC = () => {
    const { transactions, currency, openAddModal } = useBudget();

    const stats = useMemo(() => {
        return transactions.reduce(
            (acc, t) => {
                if (t.type === 'income') acc.income += t.amount;
                else acc.expense += t.amount;
                return acc;
            },
            { income: 0, expense: 0 }
        );
    }, [transactions]);

    const balance = stats.income - stats.expense;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Cinematic Hero Balance Pod */}
            <div className="lg:col-span-2 clay-card bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-10 relative overflow-hidden group border-none shadow-2xl">
                {/* Immersive background effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-[120px] group-hover:bg-blue-500/20 transition-all duration-1000"></div>
                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]"></div>

                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
                                <p className="text-blue-200/50 font-black uppercase tracking-[0.2em] text-[10px]">Solde Disponible</p>
                            </div>
                            <h2 className="text-6xl font-black tracking-tighter transition-all duration-500 group-hover:scale-[1.02] origin-left">
                                {formatCurrency(balance, currency)}
                            </h2>
                            <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-2 opacity-80">Mis à jour en temps réel</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-xl shadow-2xl transition-transform duration-700 group-hover:rotate-12">
                            <Wallet className="w-8 h-8 text-blue-300" />
                        </div>
                    </div>

                    <div className="mt-12 flex items-center gap-6">
                        <button
                            onClick={openAddModal}
                            className="bg-white text-slate-900 px-10 py-5 rounded-[2rem] font-black text-sm flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all group/btn"
                        >
                            <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-500" />
                            <span>Ajouter</span>
                        </button>
                        <Link
                            to="/history"
                            className="text-blue-200/80 px-4 py-2 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors"
                        >
                            Logs complets <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* High-Precision Glass Pods */}
            <div className="space-y-6">
                <div className="clay-card p-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-slate-800 flex flex-col justify-center h-[calc(50%-12px)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700"></div>
                    <div className="flex items-center gap-5 mb-4">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-[1.5rem] shadow-inner text-emerald-500 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total</p>
                            <span className="text-xs font-black text-emerald-500 uppercase tracking-tighter">Revenus</span>
                        </div>
                    </div>
                    <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
                        {formatCurrency(stats.income, currency)}
                    </p>
                </div>

                <div className="clay-card p-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-slate-800 flex flex-col justify-center h-[calc(50%-12px)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-red-500/10 transition-all duration-700"></div>
                    <div className="flex items-center gap-5 mb-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-[1.5rem] shadow-inner text-red-500 group-hover:scale-110 transition-transform text-red-500">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total</p>
                            <span className="text-xs font-black text-red-500 uppercase tracking-tighter">Dépenses</span>
                        </div>
                    </div>
                    <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
                        {formatCurrency(stats.expense, currency)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FinancialOverview;
