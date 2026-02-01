import React, { useState, useMemo, useEffect } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { X, Sparkles, TrendingUp, Target, Calendar, Check, Info, Zap, Loader2, BrainCircuit, AlertTriangle, TrendingDown, Shield } from 'lucide-react';
import { formatCurrency } from '../../lib/format';
import { addMonths, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AISimulationModalProps {
    isOpen: boolean;
    onClose: () => void;
    baseIncome: number;
    baseExpense: number;
}

interface Milestone {
    percentage: number;
    label: string;
    date: Date;
    amount: number;
}

interface SimulationResult {
    riskScore: number;
    timeline: {
        pessimistic: number;
        realistic: number;
        optimistic: number;
    };
    milestones: Milestone[];
    recommendations: string[];
    inflationAdjusted: number;
    emergencyFundNeeded: number;
}

const AISimulationModal: React.FC<AISimulationModalProps> = ({ isOpen, onClose, baseIncome, baseExpense }) => {
    const { currency, transactions, budgets, savingsGoals } = useBudget();

    const [projectName, setProjectName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [extraEffort, setExtraEffort] = useState('0');
    const [aiResult, setAiResult] = useState<{ score: number, advice: string } | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const monthlySavings = baseIncome - baseExpense;

    // Advanced simulation calculations
    const simulation = useMemo<SimulationResult | null>(() => {
        const goal = parseFloat(targetAmount) || 0;
        const effort = parseFloat(extraEffort) || 0;
        const totalMonthly = monthlySavings + effort;

        if (goal <= 0 || totalMonthly <= 0) return null;

        // 1. Calculate Risk Score (0-100)
        const savingsRatio = totalMonthly / baseIncome;
        const effortRatio = effort / totalMonthly;
        const budgetUtilization = budgets.length > 0
            ? budgets.reduce((sum, b) => sum + (b.spent / b.limit), 0) / budgets.length
            : 0.5;

        const riskScore = Math.round(
            (savingsRatio * 100 * 0.4) +           // 40% - Savings capacity
            ((1 - effortRatio) * 100 * 0.3) +      // 30% - Sustainability (lower effort = better)
            ((1 - budgetUtilization) * 100 * 0.2) + // 20% - Budget discipline
            (baseIncome > 0 ? 10 : 0)              // 10% - Income stability
        );

        // 2. Calculate 3 Scenarios
        const INFLATION_RATE = 0.025; // 2.5% annual
        const realisticMonths = Math.ceil(goal / totalMonthly);
        const pessimisticMonths = Math.ceil(realisticMonths * 1.25); // +25% for unexpected expenses
        const optimisticMonths = Math.ceil(realisticMonths * 0.85);  // -15% with extra income

        // 3. Inflation Adjustment
        const yearsToGoal = realisticMonths / 12;
        const inflationAdjusted = goal * Math.pow(1 + INFLATION_RATE, yearsToGoal);

        // 4. Emergency Fund (3 months expenses)
        const emergencyFundNeeded = baseExpense * 3;

        // 5. Generate Milestones
        const milestones: Milestone[] = [25, 50, 75, 100].map(pct => {
            const milestoneAmount = (goal * pct) / 100;
            const monthsToMilestone = Math.ceil((milestoneAmount / totalMonthly));
            return {
                percentage: pct,
                label: pct === 25 ? 'Foundation' : pct === 50 ? 'Mi-Parcours' : pct === 75 ? 'Dernière Ligne' : 'Objectif',
                date: addMonths(new Date(), monthsToMilestone),
                amount: milestoneAmount
            };
        });

        // 6. Context-Aware Recommendations
        const recommendations: string[] = [];

        if (riskScore < 40) {
            recommendations.push("⚠️ Score de risque faible - Augmentez votre épargne de sécurité avant ce projet");
        }
        if (effortRatio > 0.5) {
            recommendations.push("🎯 L'effort demandé est élevé (>50%) - Considérez un objectif plus réaliste");
        }
        if (realisticMonths > 24) {
            recommendations.push("📅 Objectif long terme - Divisez en sous-objectifs de 6-12 mois");
        }
        if (monthlySavings < emergencyFundNeeded / 3) {
            recommendations.push("🛡️ Priorisez d'abord un fonds d'urgence de " + formatCurrency(emergencyFundNeeded, currency));
        }
        if (inflationAdjusted > goal * 1.1) {
            recommendations.push("📈 L'inflation augmentera le coût réel de " + Math.round(((inflationAdjusted - goal) / goal) * 100) + "%");
        }
        if (riskScore >= 70) {
            recommendations.push("✅ Excellente capacité d'épargne - Vous êtes sur la bonne voie !");
        }

        // Default recommendation if none
        if (recommendations.length === 0) {
            recommendations.push("💡 Maintenez votre discipline budgétaire pour atteindre cet objectif");
        }

        return {
            riskScore,
            timeline: {
                pessimistic: pessimisticMonths,
                realistic: realisticMonths,
                optimistic: optimisticMonths
            },
            milestones,
            recommendations,
            inflationAdjusted,
            emergencyFundNeeded
        };
    }, [targetAmount, extraEffort, monthlySavings, baseIncome, baseExpense, budgets, currency]);

    useEffect(() => {
        const fetchAISimulation = async () => {
            if (!simulation || !projectName) return;
            setIsAiLoading(true);
            try {
                const financialContext = {
                    income: baseIncome,
                    expenses: baseExpense,
                    riskScore: simulation.riskScore,
                    recentTransactions: transactions.slice(0, 10).map(t => ({ cat: t.category, amt: t.amount, type: t.type })),
                    budgets: budgets.map(b => ({ cat: b.category, lim: b.limit })),
                    goals: savingsGoals.map(g => ({ name: g.name, target: g.target_amount, curr: g.current_amount }))
                };

                const res = await fetch('/api/ai/simulate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        simulationData: {
                            name: projectName,
                            target: targetAmount,
                            effort: extraEffort,
                            riskScore: simulation.riskScore,
                            timeline: simulation.timeline
                        },
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
    }, [projectName, targetAmount, extraEffort, simulation]);

    if (!isOpen) return null;

    const getRiskColor = (score: number) => {
        if (score >= 70) return 'text-lime-500';
        if (score >= 40) return 'text-amber-500';
        return 'text-red-500';
    };

    const getRiskLabel = (score: number) => {
        if (score >= 70) return 'Faible Risque';
        if (score >= 40) return 'Risque Modéré';
        return 'Risque Élevé';
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
            <div
                className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-2xl animate-in fade-in duration-700"
                onClick={onClose}
            />

            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-black rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border border-white/10 dark:border-slate-800/50 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 flex flex-col noise-texture custom-scrollbar overflow-y-auto">

                <div className="p-10 md:p-14 relative z-10 flex flex-col">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-12">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                {isAiLoading ? <Loader2 className="w-5 h-5 text-lime-500 animate-spin" /> : <Zap className="w-5 h-5 text-lime-500 animate-pulse" />}
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Simulateur Atlas Pro</h3>
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                                Simuler un <span className="text-lime-600 dark:text-lime-400">Avenir</span>
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            aria-label="Fermer"
                            className="w-14 h-14 flex items-center justify-center rounded-[1.5rem] bg-white dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-inner border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-lime-500"
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
                                    <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-lime-300" />
                                    <input
                                        type="text"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        placeholder="Ex: Achat Immobilier, Tour du monde..."
                                        className="w-full pl-16 pr-8 py-6 bg-white dark:bg-white/5 border border-slate-100 dark:border-slate-800/50 rounded-[2rem] outline-none font-bold text-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-lime-500"
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
                                        className="w-full px-8 py-6 bg-white dark:bg-white/5 border border-slate-100 dark:border-slate-800/50 rounded-[2rem] outline-none font-black text-2xl text-slate-900 dark:text-white tracking-tighter focus:ring-2 focus:ring-lime-500"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block text-lime-500">Effort Supplémentaire / mois</label>
                                    <input
                                        type="number"
                                        value={extraEffort}
                                        onChange={(e) => setExtraEffort(e.target.value)}
                                        className="w-full px-8 py-6 bg-lime-500/5 border border-lime-500/20 rounded-[2rem] outline-none font-black text-2xl text-lime-600 dark:text-lime-400 tracking-tighter focus:ring-2 focus:ring-lime-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RESULTS */}
                        {simulation ? (
                            <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
                                {/* Risk Score */}
                                <div className="p-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-black rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <Shield className={`w-6 h-6 ${getRiskColor(simulation.riskScore)}`} />
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Score de Risque</p>
                                                <p className={`text-sm font-black ${getRiskColor(simulation.riskScore)}`}>{getRiskLabel(simulation.riskScore)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-5xl font-black ${getRiskColor(simulation.riskScore)}`}>{simulation.riskScore}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">/100</p>
                                        </div>
                                    </div>
                                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${simulation.riskScore >= 70 ? 'bg-lime-500' :
                                                    simulation.riskScore >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${simulation.riskScore}%` }}
                                        />
                                    </div>
                                </div>

                                {/* 3 Scenarios */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertTriangle className="w-4 h-4 text-red-500" />
                                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Pessimiste</p>
                                        </div>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white">{simulation.timeline.pessimistic}</p>
                                        <p className="text-xs font-bold text-slate-500">mois (+25%)</p>
                                    </div>
                                    <div className="p-6 bg-lime-500/5 border-2 border-lime-500/30 rounded-2xl">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Target className="w-4 h-4 text-lime-500" />
                                            <p className="text-[9px] font-black text-lime-500 uppercase tracking-widest">Réaliste</p>
                                        </div>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white">{simulation.timeline.realistic}</p>
                                        <p className="text-xs font-bold text-slate-500">mois (base)</p>
                                    </div>
                                    <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                                        <div className="flex items-center gap-2 mb-3">
                                            <TrendingDown className="w-4 h-4 text-blue-500" />
                                            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Optimiste</p>
                                        </div>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white">{simulation.timeline.optimistic}</p>
                                        <p className="text-xs font-bold text-slate-500">mois (-15%)</p>
                                    </div>
                                </div>

                                {/* Milestones */}
                                <div className="p-8 bg-slate-900 text-white rounded-[3rem] relative overflow-hidden group border border-white/5">
                                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-lime-500/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>

                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black text-lime-400 uppercase tracking-[0.3em] mb-6">Jalons du Projet</p>
                                        <div className="space-y-4">
                                            {simulation.milestones.map((milestone, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-lime-500/20 flex items-center justify-center">
                                                            <p className="text-lg font-black text-lime-400">{milestone.percentage}%</p>
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-white">{milestone.label}</p>
                                                            <p className="text-xs text-lime-200/50 font-bold">{formatCurrency(milestone.amount, currency)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-white">{format(milestone.date, 'MMM yyyy', { locale: fr })}</p>
                                                        <p className="text-[9px] text-lime-200/50 font-bold uppercase tracking-widest">
                                                            {Math.ceil((milestone.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))} mois
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Recommendations */}
                                <div className="p-8 bg-lime-500/[0.03] dark:bg-lime-500/[0.05] rounded-[2.5rem] border border-lime-500/10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <BrainCircuit className="w-6 h-6 text-lime-500" />
                                        <p className="text-[10px] font-black text-lime-500 uppercase tracking-widest">Recommandations Atlas</p>
                                    </div>
                                    <div className="space-y-3">
                                        {simulation.recommendations.map((rec, i) => (
                                            <div key={i} className="flex items-start gap-3 p-4 bg-white dark:bg-black rounded-xl border border-lime-500/10">
                                                <div className="w-6 h-6 rounded-full bg-lime-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                    <p className="text-xs font-black text-lime-600 dark:text-lime-400">{i + 1}</p>
                                                </div>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{rec}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-slate-800">
                                        <TrendingUp className="w-5 h-5 text-lime-500 mb-3" />
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Épargne / mois</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(monthlySavings + parseFloat(extraEffort || '0'), currency)}</p>
                                    </div>
                                    <div className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-slate-800">
                                        <Calendar className="w-5 h-5 text-blue-500 mb-3" />
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Date Réaliste</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">
                                            {format(addMonths(new Date(), simulation.timeline.realistic), 'MMM yy', { locale: fr })}
                                        </p>
                                    </div>
                                    <div className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-slate-800 col-span-2 md:col-span-1">
                                        <Sparkles className="w-5 h-5 text-amber-500 mb-3" />
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Coût Réel (Inflation)</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(simulation.inflationAdjusted, currency)}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] text-center space-y-4">
                                <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                                    <Info className="w-8 h-8" />
                                </div>
                                <h4 className="text-lg font-black text-slate-400 uppercase tracking-widest">Configuration Requise</h4>
                                <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium leading-relaxed italic">
                                    Entrez un montant cible et assurez-vous d'avoir une épargne positive pour lancer le calcul Atlas.
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={onClose}
                                className="px-12 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-lime-500"
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
