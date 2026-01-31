import React, { useState, useEffect } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { EXPENSE_CATEGORIES } from '../../types';
import type { Category } from '../../types';
import {
    X,
    Zap,
    Utensils,
    Bus,
    Home,
    Music,
    ShieldCheck,
    ShoppingBag,
    GraduationCap,
    Briefcase,
    Gift,
    Sparkles,
    CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import SearchableDropdown from '../common/SearchableDropdown';
import { formatCurrency } from '../../lib/format';
import { Wallet, CreditCard, Landmark, Banknote } from 'lucide-react';

const categoryIcons: Record<string, any> = {
    'Alimentation': Utensils,
    'Transport': Bus,
    'Logement': Home,
    'Loisirs': Music,
    'Santé': ShieldCheck,
    'Vêtements': ShoppingBag,
    'Shopping': ShoppingBag,
    'Éducation': GraduationCap,
    'Professionnel': Briefcase,
    'Cadeaux': Gift,
    'Autre': Sparkles,
};

const accountIcons: Record<string, any> = {
    checking: CreditCard,
    savings: Landmark,
    cash: Banknote,
    other: Wallet
};

const QuickExpenseModal: React.FC = () => {
    const {
        addTransaction,
        isQuickAddModalOpen,
        closeQuickAddModal,
        accounts,
        currency
    } = useBudget();

    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<Category>(EXPENSE_CATEGORIES[0]);
    const [accountId, setAccountId] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Set default account when modal opens or accounts load
    useEffect(() => {
        if (accounts.length > 0 && !accountId) {
            // Prefer 'checking' or 'cash' accounts, otherwise first one
            const defaultAcc = accounts.find(a => a.type === 'checking' || a.type === 'cash') || accounts[0];
            setAccountId(defaultAcc.id);
        }
    }, [accounts, accountId]);

    // Reset state when opening
    useEffect(() => {
        if (isQuickAddModalOpen) {
            setAmount('');
            setNote('');
            setIsSuccess(false);
            setLoading(false);

            // Allow re-selection of default if needed, or keep existing if valid
            if (accounts.length > 0) {
                const defaultAcc = accounts.find(a => a.type === 'checking' || a.type === 'cash') || accounts[0];
                setAccountId(prev => prev || defaultAcc.id);
            }
        }
    }, [isQuickAddModalOpen, accounts]);

    if (!isQuickAddModalOpen) return null;

    const accountOptions = accounts.map(acc => ({
        label: acc.name,
        value: acc.id,
        subLabel: formatCurrency(acc.balance, currency),
        icon: accountIcons[acc.type] || Wallet
    }));

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!amount || isNaN(Number(amount)) || !accountId) return;

        setLoading(true);

        try {
            await addTransaction({
                amount: Number(amount),
                type: 'expense',
                category,
                date: new Date().toISOString(),
                note: note || 'Dépense rapide',
                account_id: accountId
            });

            setIsSuccess(true);
            setTimeout(() => {
                closeQuickAddModal();
            }, 1000);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={closeQuickAddModal}
            ></div>

            <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar bg-white dark:bg-black rounded-[2rem] shadow-2xl border border-slate-200/50 dark:border-slate-800 animate-in zoom-in-95 duration-300">

                <button
                    onClick={closeQuickAddModal}
                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-50 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                    <X className="w-5 h-5" />
                </button>

                {isSuccess ? (
                    <div className="p-12 text-center animate-in zoom-in-90 duration-300 flex flex-col items-center justify-center py-20">
                        <div className="w-20 h-20 bg-lime-50 dark:bg-lime-900/20 text-lime-500 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white">C'est noté !</h3>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 pb-80">
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center gap-2 justify-center px-3 py-1 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <Zap className="w-3 h-3 fill-current" />
                                Quick Add
                            </div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white">Nouvelle Dépense</h2>
                        </div>

                        {/* Amount Input */}
                        <div className="text-center py-2">
                            <div className="inline-flex items-baseline gap-2 relative group focus-within:scale-110 transition-transform duration-300">
                                <span className="text-2xl font-black text-slate-300 dark:text-slate-700">{currency}</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0"
                                    autoFocus
                                    className="bg-transparent border-none text-7xl font-black text-slate-800 dark:text-white outline-none w-[200px] text-center placeholder-slate-200 dark:placeholder-slate-800 p-0 m-0 leading-none"
                                />
                            </div>
                        </div>

                        {/* Categories Grid */}
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                            {EXPENSE_CATEGORIES.map((cat: string) => {
                                const Icon = categoryIcons[cat] || Sparkles;
                                const isActive = category === cat;
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat as Category)}
                                        className={cn(
                                            "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200",
                                            isActive
                                                ? "bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg scale-105"
                                                : "bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-[7px] font-black uppercase tracking-tight truncate w-full text-center">{cat}</span>
                                    </button>
                                )
                            })}
                        </div>

                        <div className="space-y-4">
                            <SearchableDropdown
                                label="Compte"
                                options={accountOptions}
                                value={accountId}
                                onChange={setAccountId}
                                placeholder="Sélectionner un compte"
                            />

                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Note rapide (optionnel)"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 rounded-xl border-none outline-none font-bold text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-lime-500/20 transition-all text-center"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !amount || !accountId}
                            className="w-full py-4 rounded-[1.25rem] bg-lime-500 hover:bg-lime-400 text-slate-900 font-black text-lg shadow-xl shadow-lime-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Zap className="w-5 h-5 animate-spin" /> : "Ajouter"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default QuickExpenseModal;
