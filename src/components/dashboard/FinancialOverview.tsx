import React, { useMemo } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../lib/format';
import { Plus, Wallet } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const FinancialOverview: React.FC = () => {
    const { transactions, currency, openAddModal } = useBudget();
    const { t } = useLanguage();

    const stats = useMemo(() => {
        return transactions.reduce(
            (acc, t) => {
                if (t.type === 'income') acc.income += t.amount;
                else acc.expense += t.amount;
                return acc;
            },
            { income: 0, expense: 0 }
        );
    }, [transactions]);

    const balance = stats.income - stats.expense;

    return (
        <div className="flex flex-col h-full items-center justify-center text-center space-y-8 py-6">
            <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Wallet className="w-5 h-5 text-indigo-500" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t('totalBalance')}</span>
                </div>
                <h2 className="text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {formatCurrency(balance, currency)}
                </h2>
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500 opacity-60">Fonds actuellement disponibles</p>
            </div>

            <button
                onClick={openAddModal}
                className="group relative px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
                <div className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-10 rounded-[2rem] transition-opacity"></div>
                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                <span className="font-black text-sm uppercase tracking-widest">{t('addTransactionTitle')}</span>
            </button>
        </div>
    );
};

export default FinancialOverview;
