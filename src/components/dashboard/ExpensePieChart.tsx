import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../lib/format';
import type { Transaction } from '../../types';

// Enhanced Executive Color Palette
const COLORS = [
    '#d9ff4d', // Lime (Brand Primary)
    '#0ea5e9', // Sky Blue
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#8b5cf6', // Purple
    '#ef4444', // Red
    '#10b981', // Emerald
    '#6366f1', // Indigo
    '#f97316', // Orange
    '#14b8a6'  // Teal
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

    // Custom label renderer with percentages
    const renderCustomLabel = (entry: any) => {
        const percent = ((entry.value / totalExpense) * 100).toFixed(0);
        return `${percent}%`;
    };

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
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={3}
                        cornerRadius={6}
                        dataKey="value"
                        stroke="none"
                        label={renderCustomLabel}
                        labelLine={false}
                        onClick={(data) => {
                            // Navigate to history with category filter
                            window.location.href = `/history?category=${encodeURIComponent(data.name)}`;
                        }}
                    >
                        {data.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                className="transition-opacity hover:opacity-80 cursor-pointer"
                            />
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
                        formatter={(value, entry: any) => {
                            const percent = ((entry.payload.value / totalExpense) * 100).toFixed(1);
                            return (
                                <span className="text-slate-600 dark:text-slate-300 text-xs font-bold ml-2">
                                    {value} ({percent}%)
                                </span>
                            );
                        }}
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
