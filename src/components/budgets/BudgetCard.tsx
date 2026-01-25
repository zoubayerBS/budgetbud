import React, { useState } from 'react';
import type { Budget } from '../../types';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../lib/format';
import {
    Pencil,
    X,
    Target,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface BudgetCardProps {
    budget: Budget;
    spent: number;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, spent }) => {
    const { updateBudget, currency } = useBudget();
    const [isEditing, setIsEditing] = useState(false);
    const [limit, setLimit] = useState(budget.limit.toString());

    // --- Advanced Financial Logic ---
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const remainingDays = daysInMonth - dayOfMonth + 1;

    const percentageSpent = Math.min((spent / budget.limit) * 100, 100);
    const percentageElapsed = (dayOfMonth / daysInMonth) * 100;

    // Pace: Is spending faster than time?
    const isPaceFast = (percentageSpent > percentageElapsed + 5) && spent < budget.limit;
    const isOverBudget = spent >= budget.limit;

    // Projections
    const projectedSpend = (spent / dayOfMonth) * daysInMonth;
    const isProjectedToExceed = projectedSpend > budget.limit;

    // Daily Allowance
    const dailyAllowance = Math.max(0, (budget.limit - spent) / remainingDays);

    const handleSave = () => {
        const newLimit = parseFloat(limit);
        if (!isNaN(newLimit) && newLimit > 0) {
            updateBudget(budget.category as any, newLimit);
            setIsEditing(false);
        }
    };

    return (
        <div className={cn(
            "executive-card p-8 group relative overflow-hidden flex flex-col h-full",
            isOverBudget && "border-red-500/20"
        )}>
            {/* Subtle Gradient Backdrop */}
            <div className={cn(
                "absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-10 transition-colors",
                isOverBudget ? "bg-red-500" : isPaceFast ? "bg-orange-500" : "bg-emerald-500"
            )} />

            <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
                        isOverBudget ? "bg-red-50 text-red-600" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                    )}>
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight capitalize">
                            {budget.category}
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
                            Allocation: {formatCurrency(budget.limit, currency)}
                        </p>
                    </div>
                </div>

                {!isEditing && (
                    <button
                        onClick={() => {
                            setLimit(budget.limit.toString());
                            setIsEditing(true);
                        }}
                        className="p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-400"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95">
                    <div className="soft-in p-1 rounded-2xl flex items-center pr-4">
                        <input
                            type="number"
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            className="bg-transparent w-full p-4 font-bold text-2xl text-slate-900 dark:text-white outline-none"
                            autoFocus
                        />
                        <span className="text-slate-400 font-bold uppercase text-xs">{currency}</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="flex-1 clay-button-primary py-3 rounded-xl text-sm font-bold">
                            Confirmer
                        </button>
                        <button onClick={() => setIsEditing(false)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col">
                    {/* Main Bar */}
                    <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-1000 ease-out relative group",
                                isOverBudget ? "bg-red-500" : isPaceFast ? "bg-orange-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${percentageSpent}%` }}
                        />
                        {/* Current Date Marker */}
                        {!isOverBudget && (
                            <div
                                className="absolute top-0 h-full w-0.5 bg-slate-300 dark:bg-slate-600 z-10"
                                style={{ left: `${percentageElapsed}%` }}
                            />
                        )}
                    </div>

                    {/* Pro-Gamer Metrics */}
                    <div className="grid grid-cols-2 gap-6 mb-8 mt-auto">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Utilisé</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {formatCurrency(spent, currency)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                {isOverBudget ? 'Dépassement' : 'Quotidien Max'}
                            </p>
                            <p className={cn(
                                "text-xl font-bold tracking-tight",
                                isOverBudget ? "text-red-600" : "text-slate-900 dark:text-white"
                            )}>
                                {isOverBudget
                                    ? formatCurrency(spent - budget.limit, currency)
                                    : formatCurrency(dailyAllowance, currency)
                                }
                            </p>
                        </div>
                    </div>

                    {/* Executive Forecast Row */}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                isOverBudget || isProjectedToExceed ? "bg-red-500 animate-pulse" : isPaceFast ? "bg-orange-500" : "bg-emerald-500"
                            )} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                {isOverBudget ? 'Budget Épuisé' : isProjectedToExceed ? 'Risque Projection' : 'Rythme Maîtrisé'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 italic">Projecté: {formatCurrency(projectedSpend, currency)}</span>
                            {isProjectedToExceed ? (
                                <ArrowUpRight className="w-3 h-3 text-red-500" />
                            ) : (
                                <ArrowDownRight className="w-3 h-3 text-emerald-500" />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetCard;
