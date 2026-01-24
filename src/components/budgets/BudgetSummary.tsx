import React from 'react';
import { formatCurrency } from '../../lib/format';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';

interface BudgetSummaryProps {
    totalBudget: number;
    totalSpent: number;
    currency: string;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ totalBudget, totalSpent, currency }) => {
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const remaining = totalBudget - totalSpent;
    const isHealthy = percentage < 90;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="clay-card p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-blue-100">Budget Total</p>
                        <h4 className="text-2xl font-black">{formatCurrency(totalBudget, currency as any)}</h4>
                    </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                    <div
                        className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
                <p className="text-xs font-bold text-blue-50 tracking-wide">
                    {Math.round(percentage)}% utilisé ce mois
                </p>
            </div>

            <div className="clay-card p-6 flex items-center gap-5">
                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-inner">
                    <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Reste à dépenser</p>
                    <h4 className={`text-2xl font-black ${remaining < 0 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                        {formatCurrency(Math.max(0, remaining), currency as any)}
                    </h4>
                </div>
            </div>

            <div className="clay-card p-6 flex items-center gap-5">
                <div className={`p-4 rounded-2xl shadow-inner ${isHealthy ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'}`}>
                    <TrendingDown className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Santé Budgétaire</p>
                    <h4 className={`text-xl font-black ${isHealthy ? 'text-emerald-500' : 'text-orange-500'}`}>
                        {isHealthy ? 'Excellente ✨' : 'À surveiller ⚠️'}
                    </h4>
                </div>
            </div>
        </div>
    );
};

export default BudgetSummary;
