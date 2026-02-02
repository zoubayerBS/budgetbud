import React, { useMemo } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../lib/format';
import { Gauge, AlertTriangle } from 'lucide-react';

interface VelocityMetrics {
    currentPace: number; // 0-100 percentage
    projectedSpend: number;
    totalBudget: number;
    daysElapsed: number;
    daysRemaining: number;
    zone: 'safe' | 'caution' | 'danger';
    dailyBurnRate: number;
}

const SpendingVelocityGauge: React.FC = () => {
    const { transactions, budgets, currency } = useBudget();

    const velocityMetrics = useMemo<VelocityMetrics>(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const currentDay = now.getDate();
        const daysElapsed = currentDay;
        const daysRemaining = daysInMonth - currentDay + 1;

        // Calculate total budget
        const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);

        // Calculate current month expenses
        const monthlyExpenses = transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return t.type === 'expense' &&
                    tDate.getMonth() === currentMonth &&
                    tDate.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);

        // Calculate daily burn rate
        const dailyBurnRate = daysElapsed > 0 ? monthlyExpenses / daysElapsed : 0;

        // Project month-end spending
        const projectedSpend = dailyBurnRate * daysInMonth;

        // Calculate current pace (0-100)
        // 50 = on track, <50 = under budget, >50 = over budget
        const idealPace = (daysElapsed / daysInMonth) * 100;
        const actualPace = totalBudget > 0 ? (monthlyExpenses / totalBudget) * 100 : 0;
        let currentPace = 0;
        if (totalBudget > 0) {
            currentPace = (actualPace / idealPace) * 50;
        } else if (monthlyExpenses > 0) {
            currentPace = 100; // Over budget if we have expenses but no budget
        } else {
            currentPace = 0; // No data = 0 pace
        }

        // Determine zone
        let zone: 'safe' | 'caution' | 'danger' = 'safe';
        if (projectedSpend > totalBudget * 1.1) {
            zone = 'danger';
        } else if (projectedSpend > totalBudget * 0.9) {
            zone = 'caution';
        }

        return {
            currentPace: Math.min(100, Math.max(0, currentPace)),
            projectedSpend,
            totalBudget,
            daysElapsed,
            daysRemaining,
            zone,
            dailyBurnRate
        };
    }, [transactions, budgets]);

    const getZoneColor = (zone: string) => {
        switch (zone) {
            case 'safe': return '#10b981'; // Green
            case 'caution': return '#f59e0b'; // Amber
            case 'danger': return '#ef4444'; // Red
            default: return '#64748b';
        }
    };

    const getZoneLabel = (zone: string) => {
        switch (zone) {
            case 'safe': return 'Zone Sûre';
            case 'caution': return 'Attention';
            case 'danger': return 'Danger';
            default: return 'Normal';
        }
    };

    // Calculate needle rotation (-90 to 90 degrees)
    const needleRotation = (velocityMetrics.currentPace - 50) * 1.8; // Maps 0-100 to -90 to 90

    return (
        <div className="relative bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-2xl p-6 overflow-hidden group hover:scale-[1.01] transition-transform duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Gauge className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            Vélocité de Dépenses
                        </h3>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            Rythme actuel vs budget
                        </p>
                    </div>
                </div>
                <div
                    className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider"
                    style={{
                        backgroundColor: `${getZoneColor(velocityMetrics.zone)}20`,
                        color: getZoneColor(velocityMetrics.zone)
                    }}
                >
                    {getZoneLabel(velocityMetrics.zone)}
                </div>
            </div>

            {/* Speedometer */}
            <div className="relative w-full aspect-[2/1] flex items-center justify-center mb-6">
                <svg viewBox="0 0 200 120" className="w-full h-full">
                    {/* Background Arc */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="rgba(148, 163, 184, 0.2)"
                        strokeWidth="20"
                        strokeLinecap="round"
                    />

                    {/* Safe Zone (Green) */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 100 20"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="20"
                        strokeLinecap="round"
                        opacity="0.3"
                    />

                    {/* Caution Zone (Amber) */}
                    <path
                        d="M 100 20 A 80 80 0 0 1 140 40"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="20"
                        strokeLinecap="round"
                        opacity="0.3"
                    />

                    {/* Danger Zone (Red) */}
                    <path
                        d="M 140 40 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="20"
                        strokeLinecap="round"
                        opacity="0.3"
                    />

                    {/* Needle */}
                    <g transform={`rotate(${needleRotation} 100 100)`} className="transition-transform duration-1000 ease-out">
                        <line
                            x1="100"
                            y1="100"
                            x2="100"
                            y2="30"
                            stroke={getZoneColor(velocityMetrics.zone)}
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                        <circle
                            cx="100"
                            cy="100"
                            r="6"
                            fill={getZoneColor(velocityMetrics.zone)}
                        />
                    </g>

                    {/* Center Label */}
                    <text
                        x="100"
                        y="95"
                        textAnchor="middle"
                        className="text-xs font-black fill-slate-400 dark:fill-slate-500"
                    >
                        {Math.round(velocityMetrics.currentPace)}%
                    </text>
                </svg>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Dépense Quotidienne
                    </p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                        {formatCurrency(velocityMetrics.dailyBurnRate, currency)}
                    </p>
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Projection Fin Mois
                    </p>
                    <p className={`text-sm font-black ${velocityMetrics.projectedSpend > velocityMetrics.totalBudget
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-lime-600 dark:text-lime-400'
                        }`}>
                        {formatCurrency(velocityMetrics.projectedSpend, currency)}
                    </p>
                </div>
            </div>

            {/* Warning if over budget */}
            {velocityMetrics.zone === 'danger' && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <p className="text-xs font-bold text-red-600 dark:text-red-400">
                        Vous dépasserez votre budget de {formatCurrency(velocityMetrics.projectedSpend - velocityMetrics.totalBudget, currency)}
                    </p>
                </div>
            )}
        </div>
    );
};

export default SpendingVelocityGauge;
