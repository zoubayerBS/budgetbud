import React, { useMemo } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../lib/format';
import { Plus, Wallet, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { subDays, isSameDay, parseISO } from 'date-fns';

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

    // Generate smooth wave data based on recent transactions
    const waveData = useMemo(() => {
        const points = Array.from({ length: 20 }).map((_, i) => {
            const date = subDays(new Date(), 19 - i);
            let dayBalance = 0;

            // Calculate cumulative balance up to this day for a more realistic wave
            // For simplicity in this UI component, we'll just sum transactions on that day
            // and add some "noise" for aesthetic
            transactions.forEach(t => {
                const tDate = parseISO(t.date);
                if (isSameDay(tDate, date)) {
                    if (t.type === 'income') dayBalance += t.amount;
                    else dayBalance -= t.amount;
                }
            });

            return { value: dayBalance + (Math.sin(i * 0.5) * 100) }; // Add sin wave for smoothness
        });
        return points;
    }, [transactions]);

    return (
        <div className="relative h-full w-full flex flex-col justify-between overflow-hidden bg-black rounded-[2.5rem] p-8 group border border-white/10 transition-all">
            {/* Wave Chart Background */}
            <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-1000">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={waveData}>
                        <defs>
                            <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#d9ff4d" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#d9ff4d" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#d9ff4d"
                            strokeWidth={4}
                            fill="url(#waveGradient)"
                            isAnimationActive={true}
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                        <Wallet className="w-5 h-5 text-lime-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{t('totalBalance')}</span>
                </div>

                <div className="pt-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-lime-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-lime-500/80 uppercase tracking-widest">Liquidité Totale</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
                        {formatCurrency(balance, currency)}
                    </h2>
                </div>
            </div>

            <div className="relative z-10 flex items-center justify-between pt-8">
                <p className="text-xs font-bold text-white/30 max-w-[150px]">
                    Vos actifs sont optimisés pour ce mois.
                </p>

                <button
                    onClick={openAddModal}
                    className="group relative w-14 h-14 bg-lime-500 text-black rounded-2xl shadow-[0_0_30px_rgba(217,255,77,0.3)] hover:scale-110 active:scale-90 transition-all flex items-center justify-center overflow-hidden"
                >
                    <Plus className="w-7 h-7 relative z-10 group-hover:rotate-90 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </button>
            </div>
        </div>
    );
};

export default FinancialOverview;
