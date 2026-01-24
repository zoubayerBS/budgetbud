import React, { useMemo } from 'react';
import { useBudget } from '../context/BudgetContext';
import FinancialOverview from '../components/dashboard/FinancialOverview';
import RecentActivity from '../components/dashboard/RecentActivity';
import ExpensePieChart from '../components/dashboard/ExpensePieChart';
import RecentTrendsChart from '../components/dashboard/RecentTrendsChart';
import { AlertTriangle } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { transactions, budgets, user } = useBudget();

    const alerts = useMemo(() => {
        const expensesByCategory = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        return budgets.map(budget => {
            const spent = expensesByCategory[budget.category] || 0;
            if (spent > budget.limit) {
                return {
                    category: budget.category,
                    spent,
                    limit: budget.limit,
                    type: 'danger' as const
                };
            }
            return null;
        }).filter((a): a is NonNullable<typeof a> => a !== null);
    }, [transactions, budgets]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-2 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight whitespace-nowrap">
                        Bonjour {user?.name ? user.name : ''} ! 👋
                    </h2>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tout va bien pour vos finances aujourd'hui ?</p>
                </div>
                <div className="text-sm font-bold bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm text-slate-500 mt-4 md:mt-0">
                    {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
            </div>

            {/* Smart Alerts */}
            {alerts.length > 0 && (
                <div className="grid gap-4 mb-8">
                    {alerts.map(alert => (
                        <div key={alert.category} className="clay-card bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-6 py-4 flex items-center gap-4 animate-in slide-in-from-top-2">
                            <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-xl animate-pulse">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <p className="font-bold text-sm">
                                Oups ! Le budget <strong>{alert.category}</strong> est dépassé.
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Hero Section */}
            <FinancialOverview />

            {/* Bento Grid - Middle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart - Cash Flow */}
                <div className="lg:col-span-2 clay-card p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                            Mon Évolution
                        </h3>
                        <div className="bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-xl text-xs font-bold text-slate-500">
                            7 derniers jours
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <RecentTrendsChart />
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="lg:col-span-1 clay-card p-8">
                    <RecentActivity />
                </div>
            </div>

            {/* Bottom Section - Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="clay-card p-8">
                    <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                        Où va mon argent ?
                    </h3>
                    <div className="h-[300px]">
                        <ExpensePieChart />
                    </div>
                </div>
                {/* Future widget placeholder or budgets summary could go here */}
                <div className="clay-card p-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex flex-col items-start justify-center">
                    <h3 className="text-2xl font-extrabold mb-2">Gardez le cap ! 🎯</h3>
                    <p className="text-indigo-100 font-medium mb-6 max-w-sm">Définir des petits budgets aide à réaliser de grands projets.</p>
                    <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        Voir mes budgets
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
