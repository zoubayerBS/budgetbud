import React, { useState } from 'react';
import type { Budget } from '../../types';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../lib/format';
import { Pencil, Check, X, Bell, Zap, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BudgetCardProps {
    budget: Budget;
    spent: number;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, spent }) => {
    const { updateBudget, currency } = useBudget();
    const [isEditing, setIsEditing] = useState(false);
    const [limit, setLimit] = useState(budget.limit.toString());

    const percentage = Math.min((spent / budget.limit) * 100, 100);
    const isOverBudget = spent > budget.limit;
    const isNearLimit = percentage > 85 && !isOverBudget;
    const remaining = budget.limit - spent;

    const handleSave = () => {
        const newLimit = parseFloat(limit);
        if (!isNaN(newLimit) && newLimit > 0) {
            updateBudget(budget.category as any, newLimit);
            setIsEditing(false);
        }
    };

    return (
        <div className={cn(
            "clay-card p-6 relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px]",
            isOverBudget && "ring-2 ring-red-500 shadow-xl shadow-red-500/10"
        )}>
            {/* Glossy Background Accent */}
            <div className={cn(
                "absolute -top-12 -right-12 w-24 h-24 blur-3xl rounded-full opacity-20 transition-colors",
                isOverBudget ? "bg-red-500" : isNearLimit ? "bg-orange-500" : "bg-emerald-500"
            )} />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "p-3 rounded-2xl shadow-inner",
                        isOverBudget ? "bg-red-100 text-red-600" : isNearLimit ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"
                    )}>
                        {isOverBudget ? <ShieldAlert className="w-6 h-6" /> : isNearLimit ? <Bell className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                    </div>
                    <div>
                        <h3 className="font-black text-xl text-slate-800 dark:text-white leading-tight">{budget.category}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-400 uppercase">Capacité :</span>
                            <span className="text-xs font-black text-slate-600 dark:text-slate-300">{formatCurrency(budget.limit, currency)}</span>
                        </div>
                    </div>
                </div>

                {!isEditing && (
                    <button
                        onClick={() => {
                            setLimit(budget.limit.toString());
                            setIsEditing(true);
                        }}
                        className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-400 hover:text-blue-500 transition-all shadow-sm"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="animate-in slide-in-from-right-4 duration-300">
                    <div className="relative mb-4">
                        <input
                            type="number"
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            className="w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-slate-900 dark:text-white font-black text-xl shadow-inner focus:ring-2 focus:ring-blue-500/50 outline-none"
                            autoFocus
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">{currency === 'EUR' ? '€' : '$'}</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleSave} className="flex-1 py-3 bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2">
                            <Check className="w-5 h-5" /> Enregistrer
                        </button>
                        <button onClick={() => setIsEditing(false)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="relative h-6 bg-slate-100 dark:bg-slate-900/50 rounded-2xl mb-4 overflow-hidden shadow-inner p-1">
                        <div
                            className={cn(
                                "h-full rounded-xl transition-all duration-1000 ease-out relative group",
                                isOverBudget
                                    ? "bg-gradient-to-r from-red-500 to-pink-600"
                                    : isNearLimit
                                        ? "bg-gradient-to-r from-orange-400 to-yellow-500"
                                        : "bg-gradient-to-r from-emerald-400 to-teal-500"
                            )}
                            style={{ width: `${percentage}%` }}
                        >
                            {/* Animated Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-shimmer" />
                        </div>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dépensé</span>
                            <span className="text-lg font-black text-slate-800 dark:text-white">
                                {formatCurrency(spent, currency)}
                            </span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                {isOverBudget ? 'Dépassement' : 'Disponible'}
                            </span>
                            <div className={cn(
                                "px-3 py-1 rounded-full text-xs font-black shadow-sm",
                                isOverBudget
                                    ? "bg-red-100 text-red-600"
                                    : isNearLimit
                                        ? "bg-orange-100 text-orange-600"
                                        : "bg-emerald-100 text-emerald-600"
                            )}>
                                {formatCurrency(Math.abs(remaining), currency)}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default BudgetCard;
