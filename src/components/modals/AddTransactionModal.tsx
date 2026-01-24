import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../types';
import type { Category, TransactionType } from '../../types';
import {
    X,
    Repeat,
    Zap,
    ArrowRight,
    Utensils,
    Bus,
    Home,
    Music,
    ShieldCheck,
    ShoppingBag,
    GraduationCap,
    Briefcase,
    Gift,
    Coins,
    Sparkles,
    CheckCircle2,
    TrendingUp
} from 'lucide-react';
import { cn } from '../../lib/utils';
import DatePicker from '../common/DatePicker';

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
    'Salaire': Coins,
    'Freelance': Briefcase,
    'Investissement': TrendingUp,
    'Autre': Sparkles,
};

const AddTransactionModal: React.FC = () => {
    const {
        isAddModalOpen,
        closeAddModal,
        addTransaction,
        addRecurringTemplate,
        currency
    } = useBudget();

    const [type, setType] = useState<TransactionType>('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<Category>(EXPENSE_CATEGORIES[0]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const activeCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    const handleTypeChange = (newType: TransactionType) => {
        setType(newType);
        setCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
    };

    if (!isAddModalOpen) return null;

    const handleSubmit = async () => {
        if (!amount || isNaN(Number(amount))) return;
        setLoading(true);

        const amountVal = Number(amount);
        try {
            if (isRecurring) {
                await addRecurringTemplate({
                    amount: amountVal,
                    type,
                    category,
                    frequency: 'monthly',
                    start_date: new Date(date).toISOString(),
                    note
                });
            } else {
                await addTransaction({
                    amount: amountVal,
                    type,
                    category,
                    date: new Date(date).toISOString(),
                    note
                });
            }
            setIsSuccess(true);
            setTimeout(() => {
                resetAndClose();
            }, 1200);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setIsSuccess(false);
        setAmount('');
        setNote('');
        closeAddModal();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            {/* Zen Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-700"
                onClick={resetAndClose}
            ></div>

            {/* Zen Modal Container */}
            <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800 animate-in zoom-in-95 duration-500">

                <button
                    onClick={resetAndClose}
                    className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-50 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <X className="w-5 h-5" />
                </button>

                {isSuccess ? (
                    <div className="p-12 text-center animate-in zoom-in-90 duration-500">
                        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white">Transaction Enregistrée</h3>
                        <p className="text-slate-400 font-bold mt-2">Votre cockpit est à jour.</p>
                    </div>
                ) : (
                    <div className="p-8 md:p-10 space-y-8">
                        {/* Header */}
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Nouvelle Entrée</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Édition Zen Minimaliste</p>
                        </div>

                        {/* Type Toggle - Pure Clay Style */}
                        <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl">
                            <button
                                onClick={() => handleTypeChange('expense')}
                                className={cn(
                                    "flex-1 py-3 rounded-xl font-black text-xs transition-all",
                                    type === 'expense'
                                        ? "bg-white dark:bg-slate-800 text-red-500 shadow-sm"
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                Dépense
                            </button>
                            <button
                                onClick={() => handleTypeChange('income')}
                                className={cn(
                                    "flex-1 py-3 rounded-xl font-black text-xs transition-all",
                                    type === 'income'
                                        ? "bg-white dark:bg-slate-800 text-emerald-500 shadow-sm"
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                Revenu
                            </button>
                        </div>

                        {/* Amount Input - Huge & Clean */}
                        <div className="text-center py-4">
                            <div className="inline-flex items-baseline gap-2 relative group focus-within:scale-105 transition-transform duration-500">
                                <span className="text-xl font-black text-slate-300 dark:text-slate-700">{currency}</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    autoFocus
                                    className="bg-transparent border-none text-6xl font-black text-slate-800 dark:text-white outline-none w-[200px] text-center placeholder-slate-200 dark:placeholder-slate-800"
                                />
                            </div>
                        </div>

                        {/* Category Grid - Subtle */}
                        <div className="grid grid-cols-4 gap-3">
                            {activeCategories.map((cat: string) => {
                                const Icon = categoryIcons[cat] || Sparkles;
                                const isActive = category === cat;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat as Category)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300",
                                            isActive
                                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20"
                                                : "bg-slate-50 dark:bg-slate-950 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
                                        <span className="text-[8px] font-black uppercase tracking-tight">{cat}</span>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Secondary Inputs */}
                        <div className="space-y-4">
                            <DatePicker label="Date" value={date} onChange={setDate} />

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Note</label>
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Ex: Café..."
                                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border-none outline-none font-bold text-sm text-slate-700 dark:text-slate-200 shadow-inner"
                                />
                            </div>

                            {/* Automation Zen Toggle */}
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <Repeat className={cn("w-4 h-4 transition-colors", isRecurring ? "text-amber-500" : "text-slate-300")} />
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Rendre récurrent chaque mois</span>
                                </div>
                                <button
                                    onClick={() => setIsRecurring(!isRecurring)}
                                    className={cn(
                                        "w-10 h-6 rounded-full relative transition-all duration-300",
                                        isRecurring ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-800"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                                        isRecurring ? "left-5" : "left-1"
                                    )} />
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !amount}
                            className="w-full py-5 rounded-2xl bg-slate-900 dark:bg-blue-600 text-white font-black text-lg shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <Zap className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Enregistrer Transaction</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddTransactionModal;
