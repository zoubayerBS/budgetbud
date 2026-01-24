import React from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, formatDate } from '../../lib/format';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

const RecentActivity: React.FC = () => {
    const { transactions, currency } = useBudget();
    const recent = transactions.slice(0, 5);

    return (
        <div className="bg-transparent">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Activités Récentes</h3>
                <Link to="/history" className="text-sm font-bold text-blue-500 hover:text-blue-600">Voir tout</Link>
            </div>

            <div className="space-y-4">
                {recent.length === 0 ? (
                    <div className="py-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-800">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Zéro mouvement</p>
                    </div>
                ) : (
                    recent.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group border border-transparent hover:border-white/50">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform",
                                    t.type === 'income' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : "bg-red-100 text-red-600 dark:bg-red-900/30"
                                )}>
                                    {t.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                                </div>
                                <div>
                                    <p className="font-black text-slate-800 dark:text-slate-100 text-sm tracking-tight">{t.category}</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{formatDate(t.date)}</p>
                                </div>
                            </div>
                            <span className={cn(
                                "font-black text-sm tracking-tight",
                                t.type === 'income' ? "text-emerald-600" : "text-slate-700 dark:text-slate-200"
                            )}>
                                {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount, currency)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RecentActivity;
