import React, { useMemo, useState } from 'react';
import type { Budget } from '../../types';
import { formatCurrency } from '../../lib/format';
import {
    History,
    Activity,
    LineChart,
    ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import BudgetAnalysisModal from './BudgetAnalysisModal';

interface BudgetSummaryProps {
    totalBudget: number;
    totalSpent: number;
    currency: string;
    budgets: Budget[];
    spentByCategory: Record<string, number>;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({
    totalBudget,
    totalSpent,
    currency,
    budgets,
    spentByCategory
}) => {
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const remaining = totalBudget - totalSpent;

    // --- Executive Health Score Logic ---
    const healthScore = useMemo(() => {
        if (totalBudget === 0) return 0;

        // Components:
        // 1. Utilization (Target < 85%)
        const utilBase = Math.max(0, 100 - percentage);

        // 2. Momentum
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const dayOfMonth = now.getDate();
        const timeElapsedFactor = (dayOfMonth / daysInMonth) * 100;

        const momentumScore = percentage <= timeElapsedFactor ? 100 : Math.max(0, 100 - (percentage - timeElapsedFactor) * 2);

        return Math.round((utilBase * 0.6) + (momentumScore * 0.4));
    }, [totalBudget, totalSpent, percentage]);

    const getHealthStatus = () => {
        if (healthScore > 90) return { label: 'Optimum', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
        if (healthScore > 70) return { label: 'Sain', color: 'text-blue-500', bg: 'bg-blue-500/10' };
        if (healthScore > 40) return { label: 'Vigilance', color: 'text-amber-500', bg: 'bg-amber-500/10' };
        return { label: 'Critique', color: 'text-red-500', bg: 'bg-red-500/10' };
    };

    const status = getHealthStatus();
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            {/* Primary Executive Card */}
            <div className="lg:col-span-8 executive-card p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full -mr-40 -mt-40 blur-[100px]" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Capital Alloué</p>
                            <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {formatCurrency(totalBudget, currency as any)}
                            </h3>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Efficacité</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-zinc-200 tracking-tight">{Math.round(100 - percentage)}% Libres</p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl soft-in flex items-center justify-center text-indigo-600">
                                <LineChart className="w-7 h-7" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Répartition des Flux</span>
                                <span className="text-[10px] font-bold text-slate-500">{budgets.length} Catégories Actives</span>
                            </div>
                            <div className="relative h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                                {budgets.map((b, i) => {
                                    const categorySpent = spentByCategory[b.category] || 0;
                                    const share = totalSpent > 0 ? (categorySpent / totalSpent) * 100 : 0;
                                    const colors = [
                                        'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500',
                                        'bg-rose-500', 'bg-cyan-500', 'bg-violet-500',
                                        'bg-sky-500', 'bg-teal-500'
                                    ];
                                    if (share === 0) return null;
                                    return (
                                        <div
                                            key={b.category}
                                            className={cn("h-full transition-all duration-1000", colors[i % colors.length])}
                                            style={{ width: `${share}%` }}
                                            title={`${b.category}: ${Math.round(share)}%`}
                                        />
                                    );
                                })}
                            </div>

                            <div className="flex flex-wrap gap-4 mt-4">
                                {budgets.slice(0, 4).map((b, i) => {
                                    const colors = [
                                        'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500',
                                        'bg-rose-500'
                                    ];
                                    return (
                                        <div key={b.category} className="flex items-center gap-2">
                                            <div className={cn("w-2 h-2 rounded-full", colors[i % colors.length])} />
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{b.category}</span>
                                        </div>
                                    );
                                })}
                                {budgets.length > 4 && <span className="text-[9px] font-bold text-slate-400">+{budgets.length - 4} autres</span>}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisation Critique</span>
                                <span className={cn("text-[10px] font-bold", percentage > 90 ? "text-red-500" : "text-slate-500")}>
                                    {Math.round(percentage)}% du total
                                </span>
                            </div>
                            <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000 ease-in-out",
                                        percentage > 95 ? "bg-red-500" : percentage > 80 ? "bg-amber-500" : "bg-indigo-600"
                                    )}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Décaissé: {formatCurrency(totalSpent, currency as any)}
                            </span>
                            <span className="flex items-center gap-2">
                                <History className="w-3 h-3" /> Libre: {formatCurrency(Math.max(0, remaining), currency as any)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Health Score Mini-Card */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="executive-card p-8 flex-1 flex flex-col justify-center items-center text-center relative group hover:-translate-y-1 transition-all">
                    <div className={cn("w-20 h-20 rounded-[2.5rem] flex items-center justify-center mb-6 soft-in border border-white/40 shadow-xl", status.color)}>
                        <span className="text-3xl font-black tracking-tighter">{healthScore}</span>
                    </div>

                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Santé Budgétaire</h4>
                    <div className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", status.color, status.bg, "border-current/10")}>
                        {status.label}
                    </div>

                    <p className="mt-6 text-[11px] font-medium text-slate-400 dark:text-slate-500 leading-relaxed max-w-[200px]">
                        Basé sur votre consommation actuelle et la projection de fin de mois.
                    </p>
                </div>

                <button
                    onClick={() => setIsAnalysisModalOpen(true)}
                    className="clay-button-secondary py-5 rounded-3xl flex items-center justify-center gap-3 group"
                >
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Analyses Détaillées</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <BudgetAnalysisModal
                isOpen={isAnalysisModalOpen}
                onClose={() => setIsAnalysisModalOpen(false)}
            />
        </div>
    );
};

export default BudgetSummary;
