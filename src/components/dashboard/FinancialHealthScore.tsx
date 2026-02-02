import React, { useMemo } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface HealthMetrics {
    score: number;
    budgetAdherence: number;
    savingsRate: number;
    incomeStability: number;
    spendingTrend: number;
    trend: 'up' | 'down' | 'stable';
}

const FinancialHealthScore: React.FC = () => {
    const { transactions, budgets, savingsGoals } = useBudget();

    const healthMetrics = useMemo<HealthMetrics>(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        // Current month transactions
        const currentMonthTxns = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
        });

        // Last month transactions
        const lastMonthTxns = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === lastMonth && tDate.getFullYear() === lastMonthYear;
        });

        // Calculate metrics
        const currentIncome = currentMonthTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const currentExpenses = currentMonthTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const lastMonthIncome = lastMonthTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const lastMonthExpenses = lastMonthTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        // If no data, return 0 for everything
        if (transactions.length === 0 && budgets.length === 0) {
            return {
                score: 0,
                budgetAdherence: 0,
                savingsRate: 0,
                incomeStability: 0,
                spendingTrend: 0,
                trend: 'stable'
            };
        }

        const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);

        // 1. Budget Adherence (40%) - How well staying within budget
        const budgetAdherence = totalBudget > 0
            ? Math.max(0, Math.min(100, ((totalBudget - currentExpenses) / totalBudget) * 100))
            : transactions.length > 0 ? 100 : 0; // 100 if we have data but no budgets, 0 if no data

        // 2. Savings Rate (30%) - Percentage of income saved
        const savingsRate = currentIncome > 0
            ? Math.min(100, ((currentIncome - currentExpenses) / currentIncome) * 100)
            : 0;

        // 3. Income Stability (20%) - Consistency of income
        const incomeStability = lastMonthIncome > 0
            ? Math.min(100, (Math.min(currentIncome, lastMonthIncome) / Math.max(currentIncome, lastMonthIncome)) * 100)
            : currentIncome > 0 ? 50 : 0;

        // 4. Spending Trend (10%) - Improvement in spending
        const spendingChange = lastMonthExpenses > 0
            ? ((lastMonthExpenses - currentExpenses) / lastMonthExpenses) * 100
            : 0;
        const spendingTrend = lastMonthExpenses > 0
            ? Math.max(0, Math.min(100, 50 + spendingChange))
            : (currentExpenses > 0 ? 0 : 0);

        // Calculate overall score
        const score = Math.round(
            (budgetAdherence * 0.4) +
            (Math.max(0, savingsRate) * 0.3) +
            (incomeStability * 0.2) +
            (spendingTrend * 0.1)
        );

        // Determine trend
        const lastMonthScore = 50;
        const trend = score > lastMonthScore + 5 ? 'up' : score < lastMonthScore - 5 ? 'down' : 'stable';

        return {
            score: Math.max(0, Math.min(100, score)),
            budgetAdherence,
            savingsRate: Math.max(0, savingsRate),
            incomeStability,
            spendingTrend,
            trend
        };
    }, [transactions, budgets, savingsGoals]);

    const getScoreColor = (score: number) => {
        if (score >= 71) return '#d9ff4d'; // Lime
        if (score >= 41) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    const getScoreLabel = (score: number) => {
        if (score >= 71) return 'Excellente';
        if (score >= 41) return 'Bonne';
        return 'À Améliorer';
    };

    const scoreColor = getScoreColor(healthMetrics.score);
    const circumference = 2 * Math.PI * 90; // radius = 90
    const offset = circumference - (healthMetrics.score / 100) * circumference;

    return (
        <div className="relative bg-gradient-to-br from-slate-900 via-black to-slate-900 rounded-[2.5rem] p-8 md:p-12 overflow-hidden group">
            {/* Animated Background Glow */}
            <div
                className="absolute inset-0 opacity-20 blur-3xl transition-all duration-1000"
                style={{
                    background: `radial-gradient(circle at 50% 50%, ${scoreColor}, transparent 70%)`
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Left: Score Visualization */}
                <div className="relative">
                    <svg width="240" height="240" className="transform -rotate-90">
                        {/* Background Circle */}
                        <circle
                            cx="120"
                            cy="120"
                            r="90"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="16"
                        />

                        {/* Animated Progress Arc */}
                        <circle
                            cx="120"
                            cy="120"
                            r="90"
                            fill="none"
                            stroke={scoreColor}
                            strokeWidth="16"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className="transition-all duration-2000 ease-out"
                            style={{
                                filter: `drop-shadow(0 0 20px ${scoreColor})`
                            }}
                        />
                    </svg>

                    {/* Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-6xl font-black text-white tracking-tighter">
                                {healthMetrics.score}
                            </span>
                            {healthMetrics.trend === 'up' && <TrendingUp className="w-8 h-8 text-lime-400" />}
                            {healthMetrics.trend === 'down' && <TrendingDown className="w-8 h-8 text-red-400" />}
                            {healthMetrics.trend === 'stable' && <Minus className="w-8 h-8 text-amber-400" />}
                        </div>
                        <p className="text-xs font-black text-white/60 uppercase tracking-widest">
                            {getScoreLabel(healthMetrics.score)}
                        </p>
                    </div>
                </div>

                {/* Right: Breakdown */}
                <div className="flex-1 space-y-4 w-full">
                    <div>
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                            Santé Financière
                        </h2>
                        <p className="text-sm text-white/60 font-medium">
                            Votre score global basé sur 4 indicateurs clés
                        </p>
                    </div>

                    <div className="space-y-3">
                        {/* Budget Adherence */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white/80">Respect du Budget</span>
                                <span className="text-xs font-black text-white">{Math.round(healthMetrics.budgetAdherence)}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-lime-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${healthMetrics.budgetAdherence}%` }}
                                />
                            </div>
                        </div>

                        {/* Savings Rate */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white/80">Taux d'Épargne</span>
                                <span className="text-xs font-black text-white">{Math.round(healthMetrics.savingsRate)}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${healthMetrics.savingsRate}%` }}
                                />
                            </div>
                        </div>

                        {/* Income Stability */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white/80">Stabilité des Revenus</span>
                                <span className="text-xs font-black text-white">{Math.round(healthMetrics.incomeStability)}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${healthMetrics.incomeStability}%` }}
                                />
                            </div>
                        </div>

                        {/* Spending Trend */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white/80">Tendance des Dépenses</span>
                                <span className="text-xs font-black text-white">{Math.round(healthMetrics.spendingTrend)}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${healthMetrics.spendingTrend}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialHealthScore;
