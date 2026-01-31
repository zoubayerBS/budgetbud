import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useBudget } from '../context/BudgetContext';
import Dropdown from '../components/common/Dropdown';
import TransactionItem from '../components/history/TransactionItem';
import { CATEGORIES } from '../types';
import type { Category, TransactionType } from '../types';
import { Filter, Search, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatCurrency } from '../lib/format';

const History: React.FC = () => {
    const { transactions, currency } = useBudget();
    const { t } = useLanguage();

    // Filter States
    const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
    const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Sorting and Filtering
    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(t => {
                if (filterType !== 'all' && t.type !== filterType) return false;
                if (filterCategory !== 'all' && t.category !== filterCategory) return false;
                if (searchQuery && !t.category.toLowerCase().includes(searchQuery.toLowerCase()) && !t.note?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                return true;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, filterType, filterCategory, searchQuery]);

    // Grouping by Date
    const groupedTransactions = useMemo(() => {
        const groups: { [key: string]: typeof transactions } = {};
        filteredTransactions.forEach(t => {
            const dateStr = new Date(t.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push(t);
        });
        return groups;
    }, [filteredTransactions]);

    const stats = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return { income, expense };
    }, [filteredTransactions]);

    const typeOptions = [
        { label: 'Tous les flux', value: 'all' },
        { label: 'Revenus', value: 'income' },
        { label: 'Dépenses', value: 'expense' },
    ];

    const categoryOptions = [
        { label: 'Toutes les catégories', value: 'all' },
        ...CATEGORIES.map(c => ({ label: c, value: c }))
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 px-2 sm:px-4 max-w-4xl mx-auto pb-24">
            {/* Minimalist Executive Header */}
            <header className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {t('history')}
                        </h2>
                        <p className="text-slate-500 font-medium">Historique complet de vos dépenses et revenus.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/5 border-none rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all outline-none font-bold text-sm"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                "p-2.5 rounded-xl transition-all border shrink-0",
                                showFilters
                                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
                                    : 'bg-white dark:bg-black text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                            )}
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Quick Stats Panel */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Total Transactions</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">{filteredTransactions.length}</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-3 h-3 text-lime-500" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Total Revenus</p>
                        </div>
                        <p className="text-xl font-black text-lime-600 dark:text-lime-400">{formatCurrency(stats.income, currency)}</p>
                    </div>
                    <div className="hidden sm:block p-4 bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="w-3 h-3 text-red-500" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Total Dépenses</p>
                        </div>
                        <p className="text-xl font-black text-red-600 dark:text-red-400">{formatCurrency(stats.expense, currency)}</p>
                    </div>
                </div>
            </header>

            {/* Filters Panel */}
            {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-black p-6 rounded-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Dropdown
                        label="Type de flux"
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

            {/* List Section */}
            <div className="space-y-8">
                {Object.keys(groupedTransactions).length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-black/50 rounded-3xl border border-slate-200 dark:border-slate-800">
                        <div className="max-w-xs mx-auto space-y-4">
                            <div className="w-12 h-12 bg-slate-200 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                <Search className="w-6 h-6" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Aucun résultat trouvé</h4>
                            <p className="text-slate-500 text-sm font-medium">Réessayez avec d'autres termes ou ajustez vos filtres stratégiques.</p>
                        </div>
                    </div>
                ) : (
                    Object.entries(groupedTransactions).map(([date, entries]) => (
                        <div key={date} className="space-y-3">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 drop-shadow-sm flex items-center gap-3">
                                <span className="shrink-0">{date}</span>
                                <div className="h-[1px] w-full bg-white dark:bg-white/5"></div>
                            </h3>
                            <div className="grid gap-3">
                                {entries.map(transaction => (
                                    <TransactionItem key={transaction.id} transaction={transaction} />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default History;
