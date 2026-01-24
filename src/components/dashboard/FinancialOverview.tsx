import React, { useMemo } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../lib/format';
import { TrendingUp, TrendingDown, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FinancialOverview: React.FC = () => {
    const { transactions, currency } = useBudget();

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Hero Balance Card */}
            <div className="lg:col-span-2 clay-card bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 relative overflow-hidden group border-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700 border border-white/10"></div>

                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100/60 font-black uppercase tracking-[0.2em] text-[10px] mb-2">Mon Disponible</p>
                            <h2 className="text-5xl font-black tracking-tighter">
                                {formatCurrency(balance, currency)}
                            </h2>
                        </div>
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                            <div className="w-8 h-8 rounded-full bg-red-500 -mr-4 border border-white/20"></div>
                            <div className="w-8 h-8 rounded-full bg-yellow-500 border border-white/20"></div>
                        </div>
                    </div>

                    <div className="mt-10 flex gap-4">
                        <Link to="/add" className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all">
                            <Plus className="w-5 h-5" /> Ajouter
                        </Link>
                        <Link to="/history" className="bg-blue-500/30 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 border border-white/20 hover:bg-blue-500/40 transition-all">
                            Voir tout <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Stats Column */}
            <div className="space-y-6">
                <div className="clay-card p-6 flex flex-col justify-center h-[calc(50%-12px)]">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl shadow-inner text-emerald-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-slate-400 uppercase">Revenus</span>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-800 dark:text-white pl-1">
                        {formatCurrency(stats.income, currency)}
                    </p>
                </div>

                <div className="clay-card p-6 flex flex-col justify-center h-[calc(50%-12px)]">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-red-100 dark:bg-red-500/20 rounded-2xl shadow-inner text-red-600">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-slate-400 uppercase">Dépenses</span>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-800 dark:text-white pl-1">
                        {formatCurrency(stats.expense, currency)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FinancialOverview;
