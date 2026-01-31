import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../lib/format';
import type { Transaction } from '../../types';

// Palette moderne Pastel/Neon
const COLORS = [
    '#d9ff4d', // Lime (Brand Primary)
    '#1e293b', // Slate 800
    '#475569', // Slate 600
    '#94a3b8', // Slate 400
    '#0f172a', // Slate 900
    '#ff4d4d', // Red (Contextual Expense)
    '#64748b', // Slate 500
    '#d1d5db'  // Gray 300
];

const ExpensePieChart: React.FC = () => {
    const { transactions, currency } = useBudget();

    const data = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const categoryTotals = expenses.reduce((acc: Record<string, number>, t: Transaction) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(categoryTotals)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    const totalExpense = data.reduce((sum, item) => sum + item.value, 0);

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-inner">
                    <span className="text-2xl">🤷‍♂️</span>
                </div>
                <p className="font-medium">Aucune dépense pour le moment</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        cornerRadius={8}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number | undefined) => formatCurrency(value || 0, currency)}
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            padding: '8px 12px'
                        }}
                        itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                    />
                    <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        formatter={(value) => (
                            <span className="text-slate-600 dark:text-slate-300 text-xs font-bold ml-2">{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Center Text Overlay */}
            <div
                className="absolute flex flex-col items-center justify-center pointer-events-none"
                style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -60%)'
                }}
            >
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total</span>
                <span className="text-slate-800 dark:text-white text-xl font-extrabold">{formatCurrency(totalExpense, currency)}</span>
            </div>
        </div>
    );
};

export default ExpensePieChart;
