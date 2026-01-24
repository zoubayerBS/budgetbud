import React, { useMemo } from 'react';
import { useBudget } from '../context/BudgetContext';
import FinancialOverview from '../components/dashboard/FinancialOverview';
import RecentActivity from '../components/dashboard/RecentActivity';
import ExpensePieChart from '../components/dashboard/ExpensePieChart';
import RecentTrendsChart from '../components/dashboard/RecentTrendsChart';
import { Link } from 'react-router-dom';
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 p-4 max-w-7xl mx-auto">
            {/* Command Hub Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white animate-pulse">
                            <span className="font-black text-sm">B</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
                            Status : Opérationnel
                        </h2>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-11">Commandeur {user?.name || 'Inconnu'} • Synchronisé</p>
                </div>
                <div className="flex items-center gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md px-6 py-3 rounded-2xl shadow-inner border border-white/20 dark:border-slate-800">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none">
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </div>

            {/* System Notifications (Alerts) */}
            {alerts.length > 0 && (
                <div className="grid gap-4">
                    {alerts.map((alert, idx) => (
                        <div
                            key={alert.category}
                            style={{ animationDelay: `${idx * 150}ms` }}
                            className="bg-red-500/5 dark:bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-[2rem] p-6 flex items-center justify-between group animate-in slide-in-from-top-4 duration-700"
                        >
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-red-500 text-white rounded-2xl shadow-xl shadow-red-500/40 group-hover:scale-110 transition-transform">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-red-600 dark:text-red-400 font-black text-sm uppercase tracking-widest mb-1">Alerte Critique : Budget</h4>
                                    <p className="text-slate-600 dark:text-slate-400 font-bold text-sm">
                                        Plafond radar pour <strong>{alert.category}</strong> a été franchi.
                                    </p>
                                </div>
                            </div>
                            <Link to="/budgets" className="px-6 py-3 bg-red-500/10 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                                Ajuster
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Layer 1: Cinematic Overview */}
            <div className="animate-in zoom-in-95 duration-700 delay-200">
                <FinancialOverview />
            </div>

            {/* Layer 2: Strategic Bento Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Evolution Matrix */}
                <div className="lg:col-span-8 clay-card p-10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-white/20 animate-in slide-in-from-left-4 duration-700 delay-300">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">Évolution Temporelle</h3>
                        </div>
                        <div className="bg-slate-100/50 dark:bg-slate-950/50 px-4 py-2 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200/50 dark:border-slate-800">
                            Neural Analysis: 7J
                        </div>
                    </div>
                    <div className="h-[320px]">
                        <RecentTrendsChart />
                    </div>
                </div>

                {/* Tactical activity Feed */}
                <div className="lg:col-span-4 clay-card p-10 animate-in slide-in-from-right-4 duration-700 delay-400">
                    <RecentActivity />
                </div>
            </div>

            {/* Layer 3: Distribution & Objectives */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12">
                {/* Distribution Matrix */}
                <div className="lg:col-span-5 clay-card p-10 animate-in slide-in-from-bottom-4 duration-700 delay-500">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-1.5 h-8 bg-purple-500 rounded-full"></div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">Répartition Sectorielle</h3>
                    </div>
                    <div className="h-[320px]">
                        <ExpensePieChart />
                    </div>
                </div>

                {/* Call to Action: Target Pod */}
                <div className="lg:col-span-7 clay-card p-12 bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 text-white flex flex-col items-start justify-center overflow-hidden relative border-none shadow-2xl animate-in slide-in-from-bottom-4 duration-700 delay-600 group">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-400/10 rounded-full -mr-32 -mt-32 blur-[100px] transition-transform duration-1000 group-hover:scale-125"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>

                    <div className="relative z-10 max-w-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
                                <span className="text-2xl">🎯</span>
                            </div>
                            <span className="text-[10px] font-black text-blue-200/50 uppercase tracking-[0.4em]">Neural Objective</span>
                        </div>
                        <h3 className="text-4xl font-black mb-4 tracking-tighter group-hover:translate-x-2 transition-transform duration-500">Prêt pour le prochain palier ?</h3>
                        <p className="text-indigo-100/60 font-bold mb-10 max-w-sm text-lg leading-relaxed">Le pilotage automatique financier commence avec des objectifs précis. Optimisez vos radar de budgets maintenant.</p>
                        <Link
                            to="/budgets"
                            className="bg-white text-slate-900 px-10 py-5 rounded-[2rem] font-black text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                        >
                            <span>Lancer le Lab de Budgets</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
