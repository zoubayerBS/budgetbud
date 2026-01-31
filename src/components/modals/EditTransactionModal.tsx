import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../types';
import type { Category, TransactionType, Transaction } from '../../types';
import {
    X,
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
    TrendingUp,
    CreditCard,
    Landmark,
    Banknote,
    Wallet
} from 'lucide-react';
import { cn } from '../../lib/utils';
import DatePicker from '../common/DatePicker';
import SearchableDropdown from '../common/SearchableDropdown';
import { formatCurrency } from '../../lib/format';

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

const accountIcons: Record<string, any> = {
    checking: CreditCard,
    savings: Landmark,
    cash: Banknote,
    other: Wallet
};

interface EditTransactionModalProps {
    transaction: Transaction;
    isOpen: boolean;
    onClose: () => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ transaction, isOpen, onClose }) => {
    const {
        updateTransaction,
        accounts,
        currency
    } = useBudget();

    const [type, setType] = useState<TransactionType>(transaction.type);
    const [amount, setAmount] = useState(transaction.amount.toString());
    const [category, setCategory] = useState<Category>(transaction.category as Category);
    const [date, setDate] = useState(transaction.date.split('T')[0]);
    const [note, setNote] = useState(transaction.note || '');
    const [accountId, setAccountId] = useState(transaction.account_id);
    const [targetAccountId, setTargetAccountId] = useState(transaction.target_account_id || '');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const activeCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    const accountOptions = accounts.map(acc => ({
        label: acc.name,
        value: acc.id,
        subLabel: formatCurrency(acc.balance, currency),
        icon: accountIcons[acc.type] || Wallet
    }));

    const targetAccountOptions = accounts
        .filter(acc => acc.id !== accountId)
        .map(acc => ({
            label: acc.name,
            value: acc.id,
            subLabel: formatCurrency(acc.balance, currency),
            icon: accountIcons[acc.type] || Wallet
        }));

    const handleTypeChange = (newType: TransactionType) => {
        setType(newType);
        if (newType === 'transfer') {
            setCategory('Autre');
        } else if (!activeCategories.includes(category as any)) {
            setCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!amount || isNaN(Number(amount)) || !accountId) return;
        if (type === 'transfer' && !targetAccountId) return;

        setLoading(true);

        try {
            await updateTransaction({
                ...transaction,
                amount: Number(amount),
                type,
                category,
                date: new Date(date).toISOString(),
                note,
                account_id: accountId,
                target_account_id: type === 'transfer' ? targetAccountId : undefined
            });
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1200);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-700"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-xl max-h-[90vh] bg-white dark:bg-black rounded-[2.5rem] shadow-2xl overflow-y-auto border border-slate-200/50 dark:border-slate-800 animate-in zoom-in-95 duration-500 custom-scrollbar">

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-50 rounded-full hover:bg-white dark:hover:bg-slate-800"
                >
                    <X className="w-5 h-5" />
                </button>

                {isSuccess ? (
                    <div className="p-12 text-center animate-in zoom-in-90 duration-500">
                        <div className="w-20 h-20 bg-lime-50 dark:bg-lime-900/20 text-lime-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white">Opération Modifiée</h3>
                        <p className="text-slate-400 font-bold mt-2">Les modifications ont été enregistrées.</p>
                    </div>
                ) : (
                    <div className="p-8 md:p-10 space-y-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Modifier l'Opération</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Édition de Transaction</p>
                        </div>

                        <div className="flex p-1 bg-slate-50 dark:bg-white/5 rounded-2xl">
                            {(['expense', 'income', 'transfer'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => handleTypeChange(t)}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl font-black text-xs transition-all",
                                        type === t
                                            ? "bg-white dark:bg-white/10 shadow-sm text-slate-900 dark:text-white"
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {t === 'expense' ? 'Dépense' : t === 'income' ? 'Revenu' : 'Transfert'}
                                </button>
                            ))}
                        </div>

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

                        <div className={cn(
                            "grid gap-4",
                            type === 'transfer' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                        )}>
                            <SearchableDropdown
                                label={type === 'transfer' ? 'Compte Source' : 'Compte'}
                                options={accountOptions}
                                value={accountId}
                                onChange={setAccountId}
                                placeholder="Sélectionner un compte"
                                showSearch={accounts.length > 5}
                            />

                            {type === 'transfer' && (
                                <SearchableDropdown
                                    label="Compte Destination"
                                    options={targetAccountOptions}
                                    value={targetAccountId}
                                    onChange={setTargetAccountId}
                                    placeholder="Sélectionner le compte cible"
                                    showSearch={accounts.length > 5}
                                />
                            )}
                        </div>

                        {type !== 'transfer' && (
                            <div className="grid grid-cols-4 gap-3">
                                {activeCategories.map((cat: string) => {
                                    const Icon = categoryIcons[cat] || Sparkles;
                                    const isActive = category === cat;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setCategory(cat as Category)}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 border border-transparent",
                                                isActive
                                                    ? "bg-slate-900 dark:bg-white/10 text-white dark:text-white border-slate-700 shadow-xl"
                                                    : "bg-slate-50 dark:bg-black text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                            )}
                                        >
                                            <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
                                            <span className="text-[8px] font-black uppercase tracking-tight">{cat}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        <div className="space-y-4">
                            <DatePicker label="Date" value={date} onChange={setDate} />

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Note</label>
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Note..."
                                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border-none outline-none font-bold text-sm text-slate-700 dark:text-slate-200 shadow-inner"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || !amount || (type === 'transfer' && !targetAccountId) || !accountId}
                            className="w-full py-5 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-black font-black text-lg shadow-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                        >
                            {loading ? (
                                <Zap className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Mettre à jour</span>
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

export default EditTransactionModal;
