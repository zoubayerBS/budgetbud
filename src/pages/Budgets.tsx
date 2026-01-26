import React, { useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useBudget } from '../context/BudgetContext';
import BudgetCard from '../components/budgets/BudgetCard';
import BudgetSummary from '../components/budgets/BudgetSummary';
import AddBudgetModal from '../components/budgets/AddBudgetModal';
import { Plus, Target, PieChart, LayoutList } from 'lucide-react';

const Budgets: React.FC = () => {
    const { budgets, transactions, currency } = useBudget();
    const { t } = useLanguage();
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
        <div className="max-w-6xl mx-auto py-10 px-6 space-y-12 animate-in fade-in duration-1000">
            {/* --- Executive Page Header --- */}
            <header className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl executive-card flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm">
                        <PieChart className="w-10 h-10 text-indigo-500" />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            {t('budgets')}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start italic">
                            Suivi de vos dépenses mensuelles
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="clay-button-primary px-8 py-4 rounded-2xl flex items-center gap-3 transition-transform hover:scale-[1.02] shadow-xl"
                >
                    <div className="p-1 bg-white/20 rounded-lg">
                        <Plus className="w-5 h-5" />
                    </div>
                    <span className="font-black text-sm uppercase tracking-widest">Nouveau Budget</span>
                </button>
            </header>

            {/* --- Analytics Summary Dashboard --- */}
            <BudgetSummary
                totalBudget={stats.totalBudget}
                totalSpent={stats.totalSpent}
                currency={currency}
                budgets={budgets} // [NEW] Pass for visualization
                spentByCategory={spentByCategory} // [NEW] Pass for visualization
            />

            {/* --- Budget Center Controls --- */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <LayoutList className="w-5 h-5 text-slate-400" />
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Mes Budgets</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {budgets.length > 0 ? (
                        budgets.map(budget => (
                            <BudgetCard
                                key={budget.category}
                                budget={budget}
                                spent={spentByCategory[budget.category] || 0}
                                categoryTransactions={transactions.filter(t => t.category === budget.category)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full executive-card p-24 text-center flex flex-col items-center justify-center border-dashed border-2 border-slate-200 dark:border-slate-800">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[3rem] flex items-center justify-center mb-8 soft-in border border-white/50 dark:border-slate-800 shadow-xl">
                                <Target className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-3 uppercase tracking-tighter">Aucun Budget</h3>
                            <p className="text-slate-400 dark:text-slate-500 font-bold text-sm max-w-sm mx-auto leading-relaxed">
                                Définissez votre premier budget pour commencer le suivi de vos dépenses.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <AddBudgetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default Budgets;
