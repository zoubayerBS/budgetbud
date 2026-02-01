import React, { useMemo } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../lib/format';
import { Calendar, TrendingDown } from 'lucide-react';

const DailyBudgetWidget: React.FC = () => {
    const { transactions, budgets, currency } = useBudget();

    const dailyBudget = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const currentDay = now.getDate();
        const daysRemaining = daysInMonth - currentDay + 1;

        // Calculate total monthly budget
        const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);

        // Calculate expenses this month
        const monthlyExpenses = transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return t.type === 'expense' &&
                    tDate.getMonth() === currentMonth &&
                    tDate.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);

        // Calculate remaining budget
        const remaining = totalBudget - monthlyExpenses;

        // Calculate daily safe spend
        const dailySafeSpend = daysRemaining > 0 ? remaining / daysRemaining : 0;

        return {
            totalBudget,
            monthlyExpenses,
            remaining,
            dailySafeSpend,
            daysRemaining,
            isOverBudget: remaining < 0
        };
    }, [transactions, budgets]);

    if (dailyBudget.totalBudget === 0) {
        return (
            <div className="p-6 bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                <p className="text-sm text-slate-500 font-medium">Définissez un budget pour voir votre reste à vivre quotidien</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-br from-lime-500/5 to-lime-500/10 dark:from-lime-500/10 dark:to-lime-500/5 border border-lime-500/20 rounded-2xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-500">
            {/* Decorative Background */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-lime-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-lime-500 rounded-xl flex items-center justify-center shadow-lg shadow-lime-500/20">
                            <Calendar className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Reste à Vivre</h3>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Par jour jusqu'à fin du mois</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-xs font-bold">{dailyBudget.daysRemaining}j restants</span>
                    </div>
                </div>

                {/* Main Amount */}
                <div className="text-center py-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vous pouvez dépenser</p>
                    <p className={`text-4xl font-black tracking-tighter ${dailyBudget.isOverBudget
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-lime-600 dark:text-lime-400'
                        }`}>
                        {formatCurrency(Math.max(0, dailyBudget.dailySafeSpend), currency)}
                    </p>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">par jour</p>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Budget Total</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(dailyBudget.totalBudget, currency)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dépensé</p>
                        <p className="text-sm font-black text-red-600 dark:text-red-400">{formatCurrency(dailyBudget.monthlyExpenses, currency)}</p>
                    </div>
                </div>

                {/* Warning if over budget */}
                {dailyBudget.isOverBudget && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-xs font-bold text-red-600 dark:text-red-400 text-center">
                            ⚠️ Budget dépassé de {formatCurrency(Math.abs(dailyBudget.remaining), currency)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyBudgetWidget;
