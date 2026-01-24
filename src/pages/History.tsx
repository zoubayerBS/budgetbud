import React, { useState, useMemo } from 'react';
import { useBudget } from '../context/BudgetContext';
import Dropdown from '../components/common/Dropdown';
import TransactionItem from '../components/history/TransactionItem';
import { CATEGORIES } from '../types';
import type { Category, TransactionType } from '../types';
import { Filter } from 'lucide-react';
import { cn } from '../lib/utils';

const History: React.FC = () => {
    const { transactions } = useBudget();

    // Filter States
    const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
    const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
    const [showFilters, setShowFilters] = useState(false);

    // Sorting and Filtering
    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(t => {
                if (filterType !== 'all' && t.type !== filterType) return false;
                if (filterCategory !== 'all' && t.category !== filterCategory) return false;
                return true;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, filterType, filterCategory]);

    const typeOptions = [
        { label: 'Tous', value: 'all' },
        { label: 'Revenus', value: 'income' },
        { label: 'Dépenses', value: 'expense' },
    ];

    const categoryOptions = [
        { label: 'Toutes', value: 'all' },
        ...CATEGORIES.map(c => ({ label: c, value: c }))
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 p-2 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Historique 🕰️</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">Voyagez à travers vos transactions passées.</p>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                        "clay-button p-4 flex items-center gap-3 transition-all",
                        showFilters
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    )}
                >
                    <Filter className="w-5 h-5" />
                    <span className="font-black text-sm">Filtres</span>
                </button>
            </header>

            {/* Filters Panel */}
            {showFilters && (
                <div className="clay-card p-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-300 border-white/50 backdrop-blur-3xl overflow-visible">
                    <Dropdown
                        label="Type de transaction"
                        options={typeOptions}
                        value={filterType}
                        onChange={(v) => setFilterType(v as any)}
                    />
                    <Dropdown
                        label="Catégorie"
                        options={categoryOptions}
                        value={filterCategory}
                        onChange={(v) => setFilterCategory(v as any)}
                    />
                </div>
            )}

            {/* List */}
            <div className="space-y-4">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-16 clay-card bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-slate-400 text-lg font-bold">Aucune transaction trouvée</p>
                        {(filterType !== 'all' || filterCategory !== 'all') && (
                            <button
                                onClick={() => { setFilterType('all'); setFilterCategory('all'); }}
                                className="mt-4 text-blue-600 font-bold hover:underline"
                            >
                                Effacer les filtres
                            </button>
                        )}
                    </div>
                ) : (
                    filteredTransactions.map(transaction => (
                        <TransactionItem key={transaction.id} transaction={transaction} />
                    ))
                )}
            </div>
        </div>
    );
};

export default History;
