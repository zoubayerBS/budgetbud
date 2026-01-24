import React, { useMemo, useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import BudgetCard from '../components/budgets/BudgetCard';
import BudgetSummary from '../components/budgets/BudgetSummary';
import AddBudgetModal from '../components/budgets/AddBudgetModal';
import { Plus } from 'lucide-react';

const Budgets: React.FC = () => {
    const { budgets, transactions, currency } = useBudget();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const spentByCategory = useMemo(() => {
        return transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);
    }, [transactions]);

    const stats = useMemo(() => {
        const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
        const totalSpent = budgets.reduce((sum, b) => sum + (spentByCategory[b.category] || 0), 0);
        return { totalBudget, totalSpent };
    }, [budgets, spentByCategory]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 p-2 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Budgets 💎</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">L'art de maîtriser ses finances.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="clay-button-primary flex items-center gap-2 px-6 py-4 rounded-2xl group transition-all"
                >
                    <div className="p-1 bg-white/20 rounded-lg group-hover:rotate-90 transition-transform">
                        <Plus className="w-5 h-5" />
                    </div>
                    <span className="font-black tracking-wide">Nouveau Budget</span>
                </button>
            </header>

            <BudgetSummary
                totalBudget={stats.totalBudget}
                totalSpent={stats.totalSpent}
                currency={currency}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {budgets.length > 0 ? (
                    budgets.map(budget => (
                        <BudgetCard
                            key={budget.category}
                            budget={budget}
                            spent={spentByCategory[budget.category] || 0}
                        />
                    ))
                ) : (
                    <div className="md:col-span-2 lg:col-span-3 clay-card p-12 text-center flex flex-col items-center justify-center opacity-70">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner">
                            🎯
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Aucun budget défini</h3>
                        <p className="text-slate-500 font-medium">Commencez par définir un objectif pour une catégorie !</p>
                    </div>
                )}
            </div>

            <AddBudgetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default Budgets;
