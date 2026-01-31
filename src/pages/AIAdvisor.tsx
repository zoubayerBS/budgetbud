import React, { useMemo, useState, useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from '../lib/format';
import { Sparkles, TrendingUp, TrendingDown, Target, Zap, Waves, BrainCircuit, Info, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import AISimulationModal from '../components/modals/AISimulationModal';

const AIAdvisor: React.FC = () => {
    const { transactions, savingsGoals, budgets, currency } = useBudget();
    const [isSimModalOpen, setIsSimModalOpen] = useState(false);
    const [aiInsights, setAiInsights] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // --- Neural Predictive Engine ---
    const analysis = useMemo(() => {
        const last3Months = [2, 1, 0].map(i => {
            const date = subMonths(new Date(), i);
            const start = startOfMonth(date);
            const end = endOfMonth(date);

            let income = 0;
            let expense = 0;
            transactions.forEach(t => {
                const tDate = parseISO(t.date);
                if (isWithinInterval(tDate, { start, end })) {
                    if (t.type === 'income') income += t.amount;
                    else expense += t.amount;
                }
            });
            return { income, expense };
        });

        const avgMonthlyExpense = last3Months.reduce((sum, m) => sum + m.expense, 0) / 3;
        const avgMonthlyIncome = last3Months.reduce((sum, m) => sum + m.income, 0) / 3;
        const currentBalance = transactions.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);

        // Prediction for end of next month
        const predictedBalance = currentBalance + (avgMonthlyIncome - avgMonthlyExpense);

        return {
            avgExpense: avgMonthlyExpense,
            avgIncome: avgMonthlyIncome,
            predictedBalance,
            isImproving: (avgMonthlyIncome - avgMonthlyExpense) > 0,
            burnRate: avgMonthlyIncome > 0 ? (avgMonthlyExpense / avgMonthlyIncome) * 100 : 100
        };
    }, [transactions]);

    const activeGoals = savingsGoals.filter(g => g.current_amount < g.target_amount);

    useEffect(() => {
        const fetchAIInsights = async () => {
            if (transactions.length === 0) return;
            setIsLoading(true);
            try {
                const financialData = {
                    balance: analysis.predictedBalance,
                    income: analysis.avgIncome,
                    expenses: analysis.avgExpense,
                    recentTransactions: transactions.slice(0, 20).map(t => ({ cat: t.category, amt: t.amount, type: t.type })),
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
                console.error("AI Advisor Error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAIInsights();
    }, [transactions.length, budgets.length, savingsGoals.length, analysis.avgIncome, analysis.avgExpense]);

    return (
        <div className="space-y-12 animate-in fade-in duration-1000 p-2 md:p-4 max-w-[1400px] mx-auto pb-24">

            {/* Cinematic Neural Header */}
            <div className="relative group px-2">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-lime-500/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-lime-600 rounded-xl flex items-center justify-center text-black shadow-lg shadow-lime-500/20">
                            <BrainCircuit className="w-5 h-5" />
                        </div>
                        <h1 className="text-xs font-black text-slate-400 uppercase tracking-[0.5em]">Neural Advisor v1.0</h1>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                        Votre <span className="text-lime-600 dark:text-lime-400">Assistant</span> Propulsé par IA
                    </h2>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg max-w-2xl">
                            Analyse prédictive de vos flux financiers et stratégies d'optimisation de capital.
                        </p>
                        <button
                            onClick={() => setIsSimModalOpen(true)}
                            className="w-fit px-8 py-3 bg-lime-600 dark:bg-white text-black dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 animate-blink-glow"
                        >
                            <Sparkles className="w-3 h-3" />
                            Lancer Simulation
                        </button>
                    </div>
                </div>
            </div>

            {/* Matrix Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-2">

                {/* 1. Main Projection: The "Future Seat" (8 cols) */}
                <div className="md:col-span-8 spatial-card bg-gradient-to-br from-slate-900 via-[#10141d] to-[#0a0c10] p-12 relative overflow-hidden group min-h-[500px] flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/5 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:bg-lime-500/10 transition-all duration-1000"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-2 h-2 bg-lime-400 rounded-full animate-ping"></div>
                            <p className="text-lime-300/50 font-black uppercase tracking-[0.2em] text-[10px]">Projection de Fin de Mois Prochain</p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none whitespace-nowrap">
                                {formatCurrency(analysis.predictedBalance, currency)}
                            </h3>
                            <div className="flex items-center gap-3">
                                {analysis.isImproving ? (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-lime-500/10 rounded-full">
                                        <TrendingUp className="w-4 h-4 text-lime-400" />
                                        <span className="text-lime-400 font-black text-[10px] uppercase tracking-widest">+ {formatCurrency(analysis.avgIncome - analysis.avgExpense, currency)} / mois</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full">
                                        <TrendingDown className="w-4 h-4 text-red-400" />
                                        <span className="text-red-400 font-black text-[10px] uppercase tracking-widest">{formatCurrency(analysis.avgIncome - analysis.avgExpense, currency)} / mois</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 w-full mt-10 space-y-6">
                        <div className="flex border-t border-white/5 pt-8 gap-12">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Efficacité (Burn Rate)</p>
                                <p className="text-2xl font-black text-white">{Math.round(analysis.burnRate)}%</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Capacité Mensuelle</p>
                                <p className="text-2xl font-black text-lime-400">{formatCurrency(analysis.avgIncome, currency)}</p>
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm italic font-medium max-w-md">
                            "Selon vos {transactions.length} dernières transactions, votre patrimoine est en phase de {analysis.isImproving ? 'croissance active' : 'vigilance nécessaire'}."
                        </p>
                    </div>
                </div>

                {/* 2. Tactical Metrics: Side Bento (4 cols) */}
                <div className="md:col-span-4 space-y-6">
                    <div className="bento-tile bg-white dark:bg-black/40 p-8 group relative overflow-hidden border-none shadow-xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap className="w-24 h-24 text-lime-500" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Focus Stratégique</p>
                            <h4 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter mb-2">Réduire 'Loisirs' de 15%</h4>
                            <p className="text-slate-500 text-xs font-bold leading-relaxed">
                                Cela injecterait approx. <span className="text-lime-500">{formatCurrency(analysis.avgExpense * 0.05, currency)}</span> de plus dans vos projets par mois.
                            </p>
                        </div>
                    </div>

                    <div className="bento-tile bg-lime-600 p-8 group relative overflow-hidden border-none shadow-xl shadow-lime-500/20">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Target className="w-24 h-24 text-black" />
                        </div>
                        <div className="relative z-10 text-black">
                            <p className="text-[10px] font-black text-lime-950/50 uppercase tracking-widest mb-4">Boost de Progression</p>
                            {activeGoals.length > 0 ? (
                                <>
                                    <h4 className="text-2xl font-black tracking-tighter mb-2">Objectif '{activeGoals[0].name}'</h4>
                                    <p className="text-black/60 text-xs font-bold leading-relaxed">
                                        À votre rythme actuel, vous atteindrez ce but dans environ <span className="text-black">{Math.round((activeGoals[0].target_amount - activeGoals[0].current_amount) / Math.max(1, (analysis.avgIncome - analysis.avgExpense)))} mois</span>.
                                    </p>
                                </>
                            ) : (
                                <p className="text-black/60 text-xs font-bold">Aucun objectif actif à accélérer.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Personalized Intelligence Stream (12 cols) */}
                <div className="md:col-span-12 space-y-8 mt-4">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-slate-900 dark:bg-white rounded-full"></div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Algorithmes de Richesse</h3>
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-lime-500" />}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bento-tile p-8 animate-pulse bg-white dark:bg-white/5/20 h-[250px] border-dashed border-slate-200 dark:border-slate-800" />
                            ))
                        ) : (
                            aiInsights.length > 0 ? aiInsights.map((insight, i) => {
                                const icons = [Sparkles, Info, Waves];
                                const colors = ["text-lime-500", "text-lime-500", "text-lime-600"];
                                const bgs = ["bg-lime-500/5", "bg-lime-500/5", "bg-lime-600/5"];
                                const Icon = icons[i % 3];
                                return (
                                    <div key={i} className="bento-tile p-8 group hover:border-lime-500/30 transition-all active:scale-95 min-h-[250px] flex flex-col justify-center">
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-all group-hover:scale-110", bgs[i % 3])}>
                                            <Icon className={cn("w-6 h-6", colors[i % 3])} />
                                        </div>
                                        <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter mb-2 italic">Analyse Neurale #{i + 1}</h4>
                                        <p className="text-slate-500 text-sm font-bold leading-relaxed">{insight}</p>
                                    </div>
                                );
                            }) : (
                                <div className="col-span-full p-20 text-center bg-white dark:bg-black/40 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                                    <BrainCircuit className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Intelligence contextuelle en attente de données...</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* AI Action CTA */}
            <div className="bento-tile bg-white dark:bg-black/40 p-12 text-center flex flex-col items-center gap-8 group">
                <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center text-lime-500 shadow-2xl group-hover:rotate-12 transition-transform duration-700">
                    <BrainCircuit className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Besoin d'une Simulation ?</h3>
                    <p className="text-slate-500 font-bold text-lg max-w-xl mx-auto italic">"Je peux simuler l'achat d'une maison ou d'un voyage selon vos flux actuels."</p>
                </div>
                <button
                    onClick={() => setIsSimModalOpen(true)}
                    className="px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                    Lancer Simulation
                </button>
            </div>

            <AISimulationModal
                isOpen={isSimModalOpen}
                onClose={() => setIsSimModalOpen(false)}
                baseIncome={analysis.avgIncome}
                baseExpense={analysis.avgExpense}
            />
        </div>
    );
};

export default AIAdvisor;
