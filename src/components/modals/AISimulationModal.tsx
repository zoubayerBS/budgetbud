import React, { useState, useMemo, useEffect } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { X, Sparkles, TrendingUp, Target, Calendar, Check, Info, Zap, Loader2, BrainCircuit } from 'lucide-react';
import { formatCurrency } from '../../lib/format';
import { addMonths, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AISimulationModalProps {
    isOpen: boolean;
    onClose: () => void;
    baseIncome: number;
    baseExpense: number;
}

const AISimulationModal: React.FC<AISimulationModalProps> = ({ isOpen, onClose, baseIncome, baseExpense }) => {
    const { currency, transactions, budgets, savingsGoals } = useBudget();

    const [projectName, setProjectName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [extraEffort, setExtraEffort] = useState('0');
    const [aiResult, setAiResult] = useState<{ score: number, advice: string } | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const monthlySavings = baseIncome - baseExpense;

    const mathResult = useMemo(() => {
        const goal = parseFloat(targetAmount) || 0;
        const effort = parseFloat(extraEffort) || 0;
        const totalMonthly = monthlySavings + effort;

        if (goal <= 0 || totalMonthly <= 0) return null;

        const monthsNeeded = Math.ceil(goal / totalMonthly);
        const achievementDate = addMonths(new Date(), monthsNeeded);

        return {
            monthsNeeded,
            achievementDate,
            totalMonthly
        };
    }, [targetAmount, extraEffort, monthlySavings]);

    useEffect(() => {
        const fetchAISimulation = async () => {
            if (!mathResult || !projectName) return;
            setIsAiLoading(true);
            try {
                const financialContext = {
                    income: baseIncome,
                    expenses: baseExpense,
                    recentTransactions: transactions.slice(0, 10).map(t => ({ cat: t.category, amt: t.amount, type: t.type })),
                    budgets: budgets.map(b => ({ cat: b.category, lim: b.limit })),
                    goals: savingsGoals.map(g => ({ name: g.name, target: g.target_amount, curr: g.current_amount }))
                };

                const res = await fetch('/api/ai/simulate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        simulationData: { name: projectName, target: targetAmount, effort: extraEffort },
                        financialContext
                    })
                });
                const data = await res.json();
                if (data.score !== undefined) setAiResult(data);
            } catch (err) {
                console.error("AI Simulation Error:", err);
            } finally {
                setIsAiLoading(false);
            }
        };

        const timer = setTimeout(fetchAISimulation, 1500);
        return () => clearTimeout(timer);
    }, [projectName, targetAmount, extraEffort, mathResult]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
            <div
                className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-2xl animate-in fade-in duration-700"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#0c0e12] rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border border-white/10 dark:border-slate-800/50 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 flex flex-col noise-texture custom-scrollbar overflow-y-auto">

                <div className="p-10 md:p-14 relative z-10 flex flex-col">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-12">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                {isAiLoading ? <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" /> : <Zap className="w-5 h-5 text-indigo-500 animate-pulse" />}
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Simulateur Neural</h3>
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                                Simuler un <span className="text-indigo-600 dark:text-indigo-400">Avenir</span>
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-14 h-14 flex items-center justify-center rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-inner border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-10">
                        {/* INPUTS */}
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">Quel est votre projet ?</label>
                                <div className="relative">
                                    <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
                                    <input
                                        type="text"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        placeholder="Ex: Achat Immobilier, Tour du monde..."
                                        className="w-full pl-16 pr-8 py-6 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/50 rounded-[2rem] outline-none font-bold text-lg text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">Coût Estimé ({currency})</label>
                                    <input
                                        type="number"
                                        value={targetAmount}
                                        onChange={(e) => setTargetAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/50 rounded-[2rem] outline-none font-black text-2xl text-slate-900 dark:text-white tracking-tighter"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block text-indigo-500">Effort Supplémentaire / mois</label>
                                    <input
                                        type="number"
                                        value={extraEffort}
                                        onChange={(e) => setExtraEffort(e.target.value)}
                                        className="w-full px-8 py-6 bg-indigo-500/5 border border-indigo-500/20 rounded-[2rem] outline-none font-black text-2xl text-indigo-600 dark:text-indigo-400 tracking-tighter"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RESULTS */}
                        {mathResult ? (
                            <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
                                <div className="p-10 bg-slate-900 text-white rounded-[3rem] relative overflow-hidden group border border-white/5">
                                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>

                                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                        <div className="space-y-4 text-center md:text-left">
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Date d'Accomplissement</p>
                                            <h4 className="text-5xl font-black tracking-tighter">
                                                {format(mathResult.achievementDate, 'MMMM yyyy', { locale: fr })}
                                            </h4>
                                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                                <Calendar className="w-4 h-4 text-indigo-400" />
                                                <span className="text-indigo-200/50 font-bold">Dans environ {mathResult.monthsNeeded} mois</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 shrink-0">
                                            <div className="w-20 h-20 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-3xl font-black shadow-2xl shadow-indigo-500/20 relative">
                                                {isAiLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : (aiResult?.score || "??")}
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300/50">Score Neurale</span>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Tactical Strategy */}
                                <div className="p-8 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05] rounded-[2.5rem] border border-indigo-500/10 flex items-center gap-6 group hover:bg-indigo-500/[0.08] transition-all">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0 group-hover:rotate-12 transition-transform">
                                        <BrainCircuit className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Stratégie AI Tactique</p>
                                        <p className="text-slate-600 dark:text-slate-300 font-bold italic">
                                            {isAiLoading ? "L'IA calibre votre stratégie..." : (aiResult?.advice || "En attente d'une configuration valide pour analyse...")}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 flex items-start gap-4">
                                        <TrendingUp className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Épargne Totale / mois</p>
                                            <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(mathResult.totalMonthly, currency)}</p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 flex items-start gap-4">
                                        <Target className="w-5 h-5 text-indigo-500 mt-1 shrink-0" />
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Effort Mensuel</p>
                                            <p className="text-xl font-black text-slate-900 dark:text-white">{Math.round((parseFloat(extraEffort) || 0) / (mathResult.totalMonthly) * 100)}% de l'effort</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                                    <Info className="w-8 h-8" />
                                </div>
                                <h4 className="text-lg font-black text-slate-400 uppercase tracking-widest">Configuration Requise</h4>
                                <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium leading-relaxed italic">
                                    Entrez un montant cible et assurez-vous d'avoir une épargne positive pour lancer le calcul neural.
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={onClose}
                                className="px-12 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                            >
                                Terminer <Check className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AISimulationModal;
