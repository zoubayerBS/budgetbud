import React, { useState, useMemo } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../lib/format';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BudgetRing {
    category: string;
    spent: number;
    limit: number;
    percentage: number;
    color: string;
    radius: number;
}

const InteractiveBudgetRings: React.FC = () => {
    const { transactions, budgets, currency } = useBudget();
    const navigate = useNavigate();
    const [hoveredRing, setHoveredRing] = useState<string | null>(null);

    const budgetRings = useMemo<BudgetRing[]>(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Calculate expenses by category
        const expensesByCategory = transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return t.type === 'expense' &&
                    tDate.getMonth() === currentMonth &&
                    tDate.getFullYear() === currentYear;
            })
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        // Color palette for rings
        const colors = [
            '#d9ff4d', // Lime
            '#0ea5e9', // Sky Blue
            '#f59e0b', // Amber
            '#ec4899', // Pink
            '#8b5cf6', // Purple
            '#ef4444', // Red
            '#10b981', // Emerald
            '#6366f1', // Indigo
        ];

        // Create rings data
        const rings: BudgetRing[] = budgets
            .map((budget, index) => {
                const spent = expensesByCategory[budget.category] || 0;
                const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

                return {
                    category: budget.category,
                    spent,
                    limit: budget.limit,
                    percentage: Math.min(100, percentage),
                    color: colors[index % colors.length],
                    radius: 40 + (index * 15) // Concentric rings
                };
            })
            .sort((a, b) => b.percentage - a.percentage); // Sort by usage

        return rings;
    }, [transactions, budgets]);

    if (budgetRings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-inner">
                    <span className="text-2xl">🎯</span>
                </div>
                <p className="font-medium text-center">Créez des budgets pour voir les anneaux interactifs</p>
            </div>
        );
    }

    const centerX = 120;
    const centerY = 120;

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* SVG Rings */}
            <div className="relative">
                <svg width="240" height="240" className="transform -rotate-90">
                    {budgetRings.map((ring) => {
                        const circumference = 2 * Math.PI * ring.radius;
                        const offset = circumference - (ring.percentage / 100) * circumference;
                        const isHovered = hoveredRing === ring.category;

                        return (
                            <g key={ring.category}>
                                {/* Background Circle */}
                                <circle
                                    cx={centerX}
                                    cy={centerY}
                                    r={ring.radius}
                                    fill="none"
                                    stroke="rgba(148, 163, 184, 0.1)"
                                    strokeWidth={isHovered ? "14" : "10"}
                                    className="transition-all duration-300"
                                />

                                {/* Progress Arc */}
                                <circle
                                    cx={centerX}
                                    cy={centerY}
                                    r={ring.radius}
                                    fill="none"
                                    stroke={ring.color}
                                    strokeWidth={isHovered ? "14" : "10"}
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    className="transition-all duration-500 cursor-pointer active:scale-95"
                                    style={{
                                        filter: isHovered ? `drop-shadow(0 0 10px ${ring.color})` : 'none',
                                        opacity: isHovered ? 1 : 0.8
                                    }}
                                    onMouseEnter={() => setHoveredRing(ring.category)}
                                    onMouseLeave={() => setHoveredRing(null)}
                                    onClick={() => navigate('/budgets')}
                                />
                            </g>
                        );
                    })}
                </svg>

                {/* Center Info */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    {hoveredRing ? (
                        <>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                {hoveredRing}
                            </p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {Math.round(budgetRings.find(r => r.category === hoveredRing)?.percentage || 0)}%
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                Budgets
                            </p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {budgetRings.length}
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 w-full space-y-2 max-h-32 overflow-y-auto">
                {budgetRings.map((ring) => (
                    <div
                        key={ring.category}
                        className={`flex items-center justify-between p-2 rounded-lg transition-all cursor-pointer active:scale-95 ${hoveredRing === ring.category
                                ? 'bg-slate-100 dark:bg-slate-800'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                            }`}
                        onMouseEnter={() => setHoveredRing(ring.category)}
                        onMouseLeave={() => setHoveredRing(null)}
                        onClick={() => navigate('/budgets')}
                    >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: ring.color }}
                            />
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {ring.category}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-black text-slate-500 dark:text-slate-400">
                                {formatCurrency(ring.spent, currency)} / {formatCurrency(ring.limit, currency)}
                            </span>
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InteractiveBudgetRings;
