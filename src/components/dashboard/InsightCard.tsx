import React, { useMemo, useState, useEffect } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Activity, Zap, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useBudget } from '../../context/BudgetContext';
import { Link } from 'react-router-dom';

const InsightCard: React.FC = () => {
    const { transactions, budgets, savingsGoals } = useBudget();
    const [aiInsights, setAiInsights] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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

    useEffect(() => {
        const fetchAIInsights = async () => {
            if (transactions.length === 0) return;
            setIsLoading(true);
            try {
                const financialData = {
                    balance: metrics.totalIncome - metrics.totalExpense,
                    income: metrics.totalIncome,
                    expenses: metrics.totalExpense,
                    recentTransactions: transactions.slice(0, 10).map(t => ({ cat: t.category, amt: t.amount, type: t.type })),
                    budgets: budgets.map(b => ({ cat: b.category, lim: b.limit })),
                    goals: savingsGoals.map(g => ({ name: g.name, target: g.target_amount, curr: g.current_amount }))
                };

                const res = await fetch('/api/ai/insights', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ financialData })
                });
                const data = await res.json();
                if (data.insights) setAiInsights(data.insights);
            } catch (err) {
                console.error("Failed to fetch AI insights", err);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchAIInsights, 1500);
        return () => clearTimeout(timer);
    }, [transactions.length, budgets.length, savingsGoals.length, metrics.totalIncome, metrics.totalExpense]);

    return (
        <div className="bento-tile noise-texture group h-full flex flex-col justify-between relative overflow-hidden">
            <div className={cn(
                "absolute -right-20 -top-20 w-64 h-64 blur-[100px] opacity-20 transition-all duration-1000 group-hover:opacity-40",
                isHealthy ? "bg-emerald-500" : "bg-red-500"
            )}></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-900 dark:bg-white rounded-xl text-white dark:text-slate-900 shadow-xl shadow-slate-900/10">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            {isLoading ? "Synchronisation neurale..." : "Santé financière"}
                        </span>
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
                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter min-h-[50px] flex items-center">
                        {isLoading ? (
                            <span className="animate-pulse text-slate-400">L'IA analyse vos flux...</span>
                        ) : aiInsights[0] || (
                            isHealthy
                                ? "Analyse structurelle en cours..."
                                : "Alerte de flux détectée."
                        )}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">
                        {aiInsights[1] || "Configurez vos transactions pour activer l'intelligence prédictive de BudgetBud."}
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
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest animate-pulse">Powered by Gemini 1.5</span>
                        <Link
                            to="/advisor"
                            className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-500 hover:border-indigo-500/30 transition-all shadow-sm group/ai"
                        >
                            <Sparkles className="w-4 h-4 group-hover/ai:animate-pulse" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InsightCard;
