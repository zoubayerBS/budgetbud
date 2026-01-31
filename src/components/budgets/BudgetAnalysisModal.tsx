import React, { useMemo } from 'react';
import { X, TrendingUp, TrendingDown, Zap, Info, PieChart, Sparkles } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../lib/format';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BudgetAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const BudgetAnalysisModal: React.FC<BudgetAnalysisModalProps> = ({ isOpen, onClose }) => {
    const { transactions, currency } = useBudget();

    const data = useMemo(() => {
        const last6Months = Array.from({ length: 6 }).map((_, i) => {
            const date = subMonths(new Date(), 5 - i);
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

            return {
                month: format(date, 'MMM yy', { locale: fr }),
                income,
                expense,
                saving: Math.max(0, income - expense)
            };
        });
        return last6Months;
    }, [transactions]);

    const insights = useMemo(() => {
        const currentMonth = data[data.length - 1];
        const prevMonth = data[data.length - 2];

        const expenseDiff = prevMonth?.expense > 0
            ? ((currentMonth.expense - prevMonth.expense) / prevMonth.expense) * 100
            : 0;

        const suggestions = [];
        if (expenseDiff > 10) suggestions.push("Vos dépenses ont augmenté de " + Math.round(expenseDiff) + "% par rapport au mois dernier. Surveillez vos petits achats.");
        if (currentMonth.expense > currentMonth.income) suggestions.push("Attention : Vos dépenses dépassent vos revenus ce mois-ci.");
        if (currentMonth.saving > 0) suggestions.push("Vous avez économisé " + formatCurrency(currentMonth.saving, currency) + " ce mois-ci. Bravo !");

        return suggestions;
    }, [data, currency]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-10">
            <div
                className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-xl animate-in fade-in duration-500"
                onClick={onClose}
            />

            <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white dark:bg-black rounded-[3rem] shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-lime-600 rounded-2xl flex items-center justify-center text-black shadow-xl shadow-lime-500/20">
                            <PieChart className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Analyse de Budget</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conseils et Statistiques IA</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:scale-110 active:scale-95 transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-12 pb-20 custom-scrollbar">
                    {/* 1. Area Chart: Trend */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-lime-500 rounded-full" />
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Évolution de vos finances (6 mois)</h3>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-lime-500" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenus</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dépenses</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[350px] w-full bg-white dark:bg-white/5/30 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 group">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#d9ff4d" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#d9ff4d" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.05} />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        hide
                                        domain={['auto', 'auto']}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                            borderRadius: '20px',
                                            border: 'none',
                                            padding: '16px',
                                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                                        }}
                                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                        formatter={(value: any) => [formatCurrency(Number(value), currency), '']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="income"
                                        stroke="#d9ff4d"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorIncome)"
                                        animationDuration={1500}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="expense"
                                        stroke="#f43f5e"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorExpense)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* 2. Grid Info: Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="executive-card p-8 group relative overflow-hidden bg-white dark:bg-black border border-slate-100 dark:border-slate-800">
                            <TrendingUp className="absolute -right-6 -bottom-6 w-24 h-24 text-lime-500 opacity-5 group-hover:rotate-12 transition-transform duration-700" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Moyenne Revenus</p>
                            <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {formatCurrency(data.reduce((sum, d) => sum + d.income, 0) / 6, currency)}
                            </h4>
                        </div>
                        <div className="executive-card p-8 group relative overflow-hidden bg-white dark:bg-black border border-slate-100 dark:border-slate-800">
                            <TrendingDown className="absolute -right-6 -bottom-6 w-24 h-24 text-red-500 opacity-5 group-hover:rotate-12 transition-transform duration-700" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Moyenne Dépenses</p>
                            <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter text-red-500">
                                {formatCurrency(data.reduce((sum, d) => sum + d.expense, 0) / 6, currency)}
                            </h4>
                        </div>
                        <div className="executive-card p-8 group relative overflow-hidden bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl">
                            <Zap className="absolute -right-6 -bottom-6 w-24 h-24 text-lime-400 opacity-20 group-hover:scale-120 transition-all duration-700" />
                            <p className="text-[10px] font-black text-lime-300 dark:text-lime-600 uppercase tracking-widest mb-4">Capacité d'Épargne</p>
                            <h4 className="text-3xl font-black tracking-tighter">
                                {Math.round((data.reduce((sum, d) => sum + d.saving, 0) / data.reduce((sum, d) => sum + d.income, 1)) * 100)}%
                            </h4>
                        </div>
                    </div>

                    {/* 3. Personalized Tips */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <Sparkles className="w-5 h-5 text-lime-500" />
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Conseils Personnalisés</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {insights.map((insight, i) => (
                                <div key={i} className="flex gap-4 p-6 bg-white dark:bg-white/5/40 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:border-lime-500/30 transition-all">
                                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center text-lime-500 shadow-sm shrink-0">
                                        <Info className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed">{insight}</p>
                                </div>
                            ))}
                            {insights.length === 0 && (
                                <p className="col-span-full text-center py-10 text-slate-400 font-bold italic">Continuez à enregistrer vos transactions pour obtenir des conseils plus précis.</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Footer: Close button for accessibility */}
                <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-black/50 shrink-0 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                        Fermer le rapport
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BudgetAnalysisModal;
