import React, { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useBudget } from '../context/BudgetContext';
import FinancialOverview from '../components/dashboard/FinancialOverview';
import RecentActivity from '../components/dashboard/RecentActivity';
import ExpensePieChart from '../components/dashboard/ExpensePieChart';
import MonthlyComparisonChart from '../components/dashboard/MonthlyComparisonChart';
import InsightCard from '../components/dashboard/InsightCard';
import AccountsList from '../components/dashboard/AccountsList';
import { Link } from 'react-router-dom';
import { AlertTriangle, Target, Sparkles, ChevronRight, Calendar } from 'lucide-react';
import { formatCurrency } from '../lib/format';

const Dashboard: React.FC = () => {
    const { transactions, budgets, user, savingsGoals, currency } = useBudget();
    const { t } = useLanguage();

    const totalSavingsTarget = savingsGoals.reduce((sum, g) => sum + g.target_amount, 0);
    const totalCurrentSavings = savingsGoals.reduce((sum, g) => sum + g.current_amount, 0);
    const savingsProgress = totalSavingsTarget > 0 ? (totalCurrentSavings / totalSavingsTarget) * 100 : 0;

    const alerts = useMemo(() => {
        const expensesByCategory = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
                return acc;
            }, {} as Record<string, number>);

        return budgets.map(budget => {
            const spent = expensesByCategory[budget.category] || 0;
            if (spent > budget.limit) {
                return {
                    category: budget.category,
                    spent,
                    limit: budget.limit
                };
            }
            return null;
        }).filter((a): a is NonNullable<typeof a> => a !== null);
    }, [transactions, budgets]);

    return (
        <div className="space-y-10 animate-in fade-in duration-1000 p-2 md:p-4 max-w-[1400px] mx-auto pb-24">

            {/* Header: Executive Status Bar */}
            <div className="flex flex-col md:flex-row items-end justify-between gap-6 px-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-lime-600 font-black text-[10px] uppercase tracking-[0.3em] opacity-80 mb-2">
                        <Sparkles className="w-3 h-3" />
                        <span>État du compte</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                        Bonjour, <span className="text-lime-600 dark:text-lime-400">{user?.name || 'Utilisateur'}</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-base opacity-80">Tout est sous contrôle aujourd'hui.</p>
                </div>

                <div className="flex items-center gap-4 bg-white/40 dark:bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 dark:border-slate-800 shadow-sm">
                    <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse shadow-lg shadow-lime-500/50"></div>
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </div>

            {/* BENTO GRID INFRASTRUCTURE */}
            <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[minmax(180px,_auto)] gap-6 px-2">

                {/* 1. Critical Feed: Alerts (Conditional Span) */}
                {alerts.length > 0 && (
                    <div className="md:col-span-12 animate-in slide-in-from-top-4 duration-700">
                        <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-[2rem] p-6 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-red-500 text-white rounded-2xl shadow-xl shadow-red-500/20">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-bold text-slate-700 dark:text-red-200">
                                    <span className="font-black uppercase text-[10px] tracking-widest block text-red-500 mb-0.5">Alerte Budget</span>
                                    {alerts.length} budgets dépassent vos limites de sécurité.
                                </p>
                            </div>
                            <Link to="/budgets" className="px-6 py-2.5 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-red-500/20">
                                Agir
                            </Link>
                        </div>
                    </div>
                )}

                {/* 2. Global Vision: Financial Overview (8 cols) */}
                <div className="md:col-span-8 md:row-span-2 relative group overflow-hidden rounded-[2.5rem] shadow-2xl transition-all duration-700 hover:shadow-lime-500/10 active:scale-[0.99] border border-slate-100 dark:border-white/5 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black group-hover:from-black group-hover:to-slate-900 transition-all duration-1000"></div>
                    <div className="relative z-10 w-full h-full">
                        <FinancialOverview />
                    </div>
                </div>

                {/* 3. Smart Pulse: Insight Card & Accounts (4 cols) */}
                <div className="md:col-span-4 md:row-span-2 space-y-6">
                    <div className="hover:scale-[1.01] transition-transform duration-500">
                        <InsightCard />
                    </div>
                    <div className="bento-tile bg-white dark:bg-black/40 border-l-4 border-lime-500/20">
                        <AccountsList />
                    </div>
                </div>

                {/* 4. Temporal Stream: Monthly Comparison (12 cols) */}
                <div className="md:col-span-12 md:row-span-2 bento-tile bg-white dark:bg-black text-slate-900 dark:text-white border border-slate-100 dark:border-white/5 relative overflow-hidden group hover:shadow-lime-500/10 transition-all duration-700">
                    <div className="absolute inset-0 bg-lime-500/5 dark:bg-lime-500/5"></div>
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-lime-500 rounded-full"></div>
                                <h3 className="text-xl font-black tracking-tighter">Comparaison Mensuelle</h3>
                            </div>
                            <Calendar className="w-5 h-5 opacity-40" />
                        </div>
                        <div className="flex-1 min-h-[220px]">
                            <MonthlyComparisonChart />
                        </div>
                    </div>
                </div>

                {/* 5. Sectorial Matrix: Distribution (5 cols) */}
                <div className="md:col-span-5 md:row-span-3 bento-tile bg-white dark:bg-black/40 border-l-4 border-lime-500/20 hover:scale-[1.01] transition-transform duration-500">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-lime-500 rounded-full"></div>
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Où va votre argent</h3>
                        </div>
                        <span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse"></span>
                    </div>
                    <div className="h-[360px]">
                        <ExpensePieChart />
                    </div>
                </div>

                {/* 6. Execution Stream: Recent Activity (7 cols) */}
                <div className="md:col-span-7 md:row-span-3 bento-tile bg-white dark:bg-black/40 relative overflow-hidden hover:scale-[1.01] transition-transform duration-500">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-lime-500/5 rounded-full blur-3xl"></div>
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-5 bg-lime-500 rounded-full"></div>
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('recentActivity')}</h3>
                        </div>
                        <Link to="/history" className="p-2 bg-white dark:bg-white/5 rounded-full hover:bg-lime-500 hover:text-black dark:hover:bg-lime-400 dark:hover:text-black transition-all">
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="relative z-10">
                        <RecentActivity />
                    </div>
                </div>

                {/* 7. Strategic Target: Savings (12 cols) */}
                <div className="md:col-span-12 md:row-span-2 spatial-card group h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <div className="relative z-10 p-10 h-full flex flex-col md:flex-row items-center justify-between gap-10 group-hover:text-white transition-colors duration-500">
                        <div className="flex items-center gap-6 flex-wrap justify-center md:justify-start">
                            <div className="w-20 h-20 bg-lime-500/10 rounded-[2.5rem] border border-lime-500/20 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-700 group-hover:rotate-[360deg]">
                                <Target className="w-10 h-10 text-lime-500 group-hover:text-lime-400" />
                            </div>
                            <div className="space-y-1 text-center md:text-left">
                                <h3 className="text-4xl font-black tracking-tighter">Objectifs d'Épargne</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-bold text-lg group-hover:text-white/60">
                                    {Math.round(savingsProgress)}% de vos objectifs atteints.
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 max-w-2xl w-full">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Économisé</span>
                                <span className="text-3xl font-black tracking-tighter">{formatCurrency(totalCurrentSavings, currency)}</span>
                            </div>
                            <div className="h-4 bg-white dark:bg-white/5 rounded-full overflow-hidden p-1 shadow-inner group-hover:bg-white/10">
                                <div
                                    className="h-full bg-lime-600 dark:bg-lime-400 group-hover:bg-lime-400 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                    style={{ width: `${Math.min(savingsProgress, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <Link
                                to="/advisor"
                                className="px-8 py-6 bg-lime-500/10 backdrop-blur-md text-lime-600 dark:text-lime-400 rounded-[2.5rem] font-black text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest border border-lime-500/20 flex items-center gap-2 group/btn animate-blink-glow"
                            >
                                <Sparkles className="w-4 h-4 text-lime-400 group-hover/btn:animate-pulse" />
                                Simulation IA
                            </Link>
                            <Link
                                to="/savings"
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-12 py-6 rounded-[2.5rem] font-black text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest border border-white/10"
                            >
                                Gérer
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
