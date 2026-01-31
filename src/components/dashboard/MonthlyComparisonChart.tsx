import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../lib/format';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const MonthlyComparisonChart: React.FC = () => {
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
                net: income - expense
            };
        });

        return last6Months;
    }, [transactions]);

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.05} />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                            borderRadius: '24px',
                            border: 'none',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                            padding: '20px'
                        }}
                        itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                        formatter={(value: any) => [formatCurrency(Number(value) || 0, currency), '']}
                    />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    />
                    <Bar
                        dataKey="income"
                        name="Revenus"
                        fill="#a6ce17ff"
                        radius={[6, 6, 0, 0]}
                        barSize={32}
                    />
                    <Bar
                        dataKey="expense"
                        name="Dépenses"
                        fill="#ff4d4d"
                        radius={[6, 6, 0, 0]}
                        barSize={32}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MonthlyComparisonChart;
