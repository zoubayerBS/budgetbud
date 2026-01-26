import React from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, formatDate } from '../../lib/format';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

const RecentActivity: React.FC = () => {
    const { transactions, currency } = useBudget();
    const recent = transactions.slice(0, 6);

    if (recent.length === 0) {
        return (
            <div className="py-12 text-center bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] border-dashed border-2 border-slate-200 dark:border-slate-800 animate-in fade-in duration-700">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Aucune activité récente</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {recent.map((t, idx) => (
                <div
                    key={t.id}
                    style={{ animationDelay: `${idx * 100}ms` }}
                    className="flex items-center justify-between p-4 sm:p-5 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group border border-transparent hover:border-blue-500/20 active:scale-[0.98] animate-in slide-in-from-right-4"
                >
                    <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                        <div className={cn(
                            "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative shrink-0",
                            t.type === 'income' ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20" : "bg-red-50 text-red-500 dark:bg-red-900/20"
                        )}>
                            <div className={cn(
                                "absolute inset-0 rounded-2xl opacity-20 blur-sm group-hover:blur-md transition-all",
                                t.type === 'income' ? "bg-emerald-500" : "bg-red-500"
                            )}></div>
                            {t.type === 'income' ? <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" /> : <ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                            <p className="font-black text-slate-800 dark:text-slate-100 text-sm tracking-tight leading-none truncate">{t.category}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{formatDate(t.date)}</p>
                        </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                        <span className={cn(
                            "font-black text-sm sm:text-base tracking-tighter block",
                            t.type === 'income' ? "text-emerald-500" : "text-slate-800 dark:text-slate-200"
                        )}>
                            {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount, currency)}
                        </span>
                        <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest leading-none">Flux Actif</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecentActivity;
