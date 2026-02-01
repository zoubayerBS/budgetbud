import React, { useState, useEffect, useMemo } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../lib/format';
import {
    TrendingDown, TrendingUp, Target, Coffee, Calendar,
    Sparkles, ChevronLeft, ChevronRight
} from 'lucide-react';

interface Insight {
    id: string;
    icon: React.ReactNode;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info' | 'achievement';
}

const AIInsightsCarousel: React.FC = () => {
    const { transactions, budgets, savingsGoals, currency } = useBudget();
    const [currentIndex, setCurrentIndex] = useState(0);

    const insights = useMemo<Insight[]>(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const generatedInsights: Insight[] = [];

        // Current month data
        const currentMonthTxns = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
        });

        const lastMonthTxns = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === lastMonth && tDate.getFullYear() === lastMonthYear;
        });

        const currentExpenses = currentMonthTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const lastMonthExpenses = lastMonthTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        // Insight 1: Spending Trend
        if (lastMonthExpenses > 0) {
            const change = ((currentExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
            if (change < -10) {
                generatedInsights.push({
                    id: 'spending-down',
                    icon: <TrendingDown className="w-6 h-6" />,
                    title: 'Excellente Performance',
                    message: `Vous dépensez ${Math.abs(Math.round(change))}% de moins ce mois-ci ! 🎉`,
                    type: 'success'
                });
            } else if (change > 15) {
                generatedInsights.push({
                    id: 'spending-up',
                    icon: <TrendingUp className="w-6 h-6" />,
                    title: 'Attention aux Dépenses',
                    message: `Vos dépenses ont augmenté de ${Math.round(change)}% ce mois-ci`,
                    type: 'warning'
                });
            }
        }

        // Insight 2: Savings Progress
        const totalSavingsTarget = savingsGoals.reduce((sum, g) => sum + g.target_amount, 0);
        const totalCurrentSavings = savingsGoals.reduce((sum, g) => sum + g.current_amount, 0);
        if (totalSavingsTarget > 0) {
            const progress = (totalCurrentSavings / totalSavingsTarget) * 100;
            if (progress >= 75) {
                generatedInsights.push({
                    id: 'savings-progress',
                    icon: <Target className="w-6 h-6" />,
                    title: 'Objectif Presque Atteint',
                    message: `Vos objectifs d'épargne sont à ${Math.round(progress)}% ! 🎯`,
                    type: 'achievement'
                });
            }
        }

        // Insight 3: Category Analysis
        const categoryExpenses: Record<string, number> = {};
        currentMonthTxns.filter(t => t.type === 'expense').forEach(t => {
            categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
        });

        const topCategory = Object.entries(categoryExpenses).sort((a, b) => b[1] - a[1])[0];
        if (topCategory) {
            const [category, amount] = topCategory;
            const percentage = currentExpenses > 0 ? (amount / currentExpenses) * 100 : 0;
            generatedInsights.push({
                id: 'top-category',
                icon: <Sparkles className="w-6 h-6" />,
                title: 'Catégorie Dominante',
                message: `${category} représente ${Math.round(percentage)}% de vos dépenses (${formatCurrency(amount, currency)})`,
                type: 'info'
            });
        }

        // Insight 4: Frequent Small Expenses
        const smallExpenses = currentMonthTxns.filter(t => t.type === 'expense' && t.amount < 10);
        if (smallExpenses.length > 10) {
            const totalSmall = smallExpenses.reduce((sum, t) => sum + t.amount, 0);
            generatedInsights.push({
                id: 'small-expenses',
                icon: <Coffee className="w-6 h-6" />,
                title: 'Petites Dépenses Fréquentes',
                message: `${smallExpenses.length} petites dépenses totalisent ${formatCurrency(totalSmall, currency)} ce mois`,
                type: 'info'
            });
        }

        // Insight 5: Budget Status
        const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
        if (totalBudget > 0) {
            const remaining = totalBudget - currentExpenses;
            const daysRemaining = new Date(currentYear, currentMonth + 1, 0).getDate() - now.getDate() + 1;
            if (remaining > 0 && daysRemaining > 0) {
                generatedInsights.push({
                    id: 'budget-remaining',
                    icon: <Calendar className="w-6 h-6" />,
                    title: 'Budget Restant',
                    message: `Il vous reste ${formatCurrency(remaining, currency)} pour ${daysRemaining} jours`,
                    type: 'info'
                });
            }
        }

        // Default insight if none generated
        if (generatedInsights.length === 0) {
            generatedInsights.push({
                id: 'default',
                icon: <Sparkles className="w-6 h-6" />,
                title: 'Bienvenue',
                message: 'Ajoutez des transactions pour voir des insights personnalisés',
                type: 'info'
            });
        }

        return generatedInsights;
    }, [transactions, budgets, savingsGoals, currency]);

    // Auto-advance carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % insights.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [insights.length]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + insights.length) % insights.length);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % insights.length);
    };

    const currentInsight = insights[currentIndex];

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return 'from-lime-500/10 to-lime-500/5 border-lime-500/20';
            case 'warning': return 'from-amber-500/10 to-amber-500/5 border-amber-500/20';
            case 'achievement': return 'from-purple-500/10 to-purple-500/5 border-purple-500/20';
            default: return 'from-blue-500/10 to-blue-500/5 border-blue-500/20';
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-lime-500';
            case 'warning': return 'text-amber-500';
            case 'achievement': return 'text-purple-500';
            default: return 'text-blue-500';
        }
    };

    return (
        <div className={`relative bg-gradient-to-br ${getTypeColor(currentInsight.type)} border rounded-2xl p-6 overflow-hidden group`}>
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-current opacity-5 rounded-full blur-3xl"></div>

            {/* Content */}
            <div className="relative z-10 flex items-center gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconColor(currentInsight.type)} bg-white dark:bg-black shadow-lg shrink-0`}>
                    {currentInsight.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                        {currentInsight.title}
                    </h3>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {currentInsight.message}
                    </p>
                </div>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center justify-center gap-3 mt-6">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    aria-label="Insight précédent"
                    className="w-11 h-11 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 dark:focus:ring-offset-black"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Dots */}
                <div className="flex items-center gap-2" role="tablist" aria-label="Insights navigation">
                    {insights.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            role="tab"
                            aria-selected={index === currentIndex}
                            aria-label={`Aller à l'insight ${index + 1}`}
                            className={`transition-all rounded-full focus:outline-none focus:ring-2 focus:ring-lime-500 ${index === currentIndex
                                    ? 'w-8 h-2 bg-lime-500'
                                    : 'w-2 h-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                                }`}
                        />
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentIndex === insights.length - 1}
                    aria-label="Insight suivant"
                    className="w-11 h-11 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 dark:focus:ring-offset-black"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default AIInsightsCarousel;
