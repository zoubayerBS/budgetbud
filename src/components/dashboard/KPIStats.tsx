import React, { useMemo } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../lib/format';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Transaction } from '../../types';

const KPIStats: React.FC = () => {
    const { transactions, currency } = useBudget();

    const stats = useMemo(() => {
        return transactions.reduce(
            (acc: { income: number; expense: number }, t: Transaction) => {
                if (t.type === 'income') {
                    acc.income += t.amount;
                } else {
                    acc.expense += t.amount;
                }
                return acc;
            },
            { income: 0, expense: 0 }
        );
    }, [transactions]);

    const balance = stats.income - stats.expense;

    const cards = [
        {
            label: 'Revenus',
            amount: stats.income,
            icon: TrendingUp,
            color: 'text-lime-600 dark:text-lime-400',
            bgColor: 'bg-lime-500/10 dark:bg-lime-500/20',
        },
        {
            label: 'Dépenses',
            amount: stats.expense,
            icon: TrendingDown,
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-500/10 dark:bg-red-500/20',
        },
        {
            label: 'Solde',
            amount: balance,
            icon: Wallet,
            color: 'text-lime-600 dark:text-lime-400',
            bgColor: 'bg-lime-500/10 dark:bg-lime-500/20',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {cards.map((card) => (
                <div key={card.label} className="clay-card p-6 flex items-center justify-between hover:-translate-y-1 transition-transform">
                    <div>
                        <p className="text-sm text-slate-400 font-bold mb-1 uppercase tracking-wider">{card.label}</p>
                        <h3 className={cn("text-3xl font-extrabold tracking-tight", card.color)}>
                            {formatCurrency(card.amount, currency)}
                        </h3>
                    </div>
                    <div className={cn("p-4 rounded-2xl shadow-inner", card.bgColor)}>
                        <card.icon className={cn("w-8 h-8", card.color)} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KPIStats;
