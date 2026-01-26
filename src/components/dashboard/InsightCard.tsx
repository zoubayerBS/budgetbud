import React, { useMemo } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useBudget } from '../../context/BudgetContext';

const InsightCard: React.FC = () => {
    const { transactions } = useBudget();

    const metrics = useMemo(() => {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);
        return { totalIncome, totalExpense };
    }, [transactions]);

    const isHealthy = metrics.totalExpense < metrics.totalIncome;
    const savingsRate = metrics.totalIncome > 0
        ? ((metrics.totalIncome - metrics.totalExpense) / metrics.totalIncome) * 100
        : 0;

    return (
        <div className="bento-tile noise-texture group h-full flex flex-col justify-between relative overflow-hidden">
            {/* Animated background pulse */}
            <div className={cn(
                "absolute -right-20 -top-20 w-64 h-64 blur-[100px] opacity-20 transition-all duration-1000 group-hover:opacity-40",
                isHealthy ? "bg-emerald-500" : "bg-red-500"
            )}></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-900 dark:bg-white rounded-xl text-white dark:text-slate-900 shadow-xl shadow-slate-900/10">
                            <Zap className="w-5 h-5 fill-current" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Santé financière</span>
                    </div>
                    <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                        isHealthy
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                    )}>
                        <Activity className="w-3 h-3" />
                        {isHealthy ? "En forme" : "Attention"}
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter">
                        {isHealthy
                            ? "Vous économisez de l'argent ce mois-ci."
                            : "Vous dépensez beaucoup ce mois-ci."}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">
                        {isHealthy
                            ? `Vous avez gardé ${Math.round(savingsRate)}% de vos revenus. C'est très bien pour vos économies.`
                            : "Il est temps de réduire quelques dépenses pour rééquilibrer votre budget."}
                    </p>
                </div>
            </div>

            <div className="mt-8 relative z-10">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Taux d'épargne</p>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {Math.round(savingsRate)}%
                            </span>
                            {isHealthy ? (
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                            ) : (
                                <TrendingDown className="w-5 h-5 text-red-500" />
                            )}
                        </div>
                    </div>
                    <button className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm">
                        <Sparkles className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InsightCard;
