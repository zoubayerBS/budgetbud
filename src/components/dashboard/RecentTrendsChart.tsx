import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../lib/format';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const RecentTrendsChart: React.FC = () => {
    const { transactions, currency } = useBudget();

    const data = useMemo(() => {
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const date = subDays(new Date(), 6 - i);
            return {
                date,
                label: format(date, 'd MMM', { locale: fr }),
                income: 0,
                expense: 0,
            };
        });

        transactions.forEach(t => {
            const tDate = parseISO(t.date);
            const dayStat = last7Days.find(d => isSameDay(d.date, tDate));
            if (dayStat) {
                if (t.type === 'income') {
                    dayStat.income += t.amount;
                } else {
                    dayStat.expense += t.amount;
                }
            }
        });

        return last7Days;
    }, [transactions]);

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d9ff4d" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#d9ff4d" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff4d4d" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ff4d4d" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '8px 8px 16px rgba(0,0,0,0.1), inset -2px -2px 4px rgba(0,0,0,0.05), inset 2px 2px 4px rgba(255,255,255,0.5)',
                            padding: '12px 16px'
                        }}
                        formatter={(value: number | undefined) => [`${formatCurrency(value || 0, currency)}`, '']}
                        labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '8px' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#d9ff4d"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorIncome)"
                        name="Revenus"
                    />
                    <Area
                        type="monotone"
                        dataKey="expense"
                        stroke="#ff4d4d"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorExpense)"
                        name="Dépenses"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RecentTrendsChart;
