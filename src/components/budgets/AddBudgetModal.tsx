import React, { useState } from 'react';
import { X, Check, Target, BrainCircuit } from 'lucide-react';
import { EXPENSE_CATEGORIES, type Category } from '../../types';
import { useBudget } from '../../context/BudgetContext';
import SearchableDropdown from '../common/SearchableDropdown';
import { CreditCard, Landmark, Banknote, Wallet } from 'lucide-react';
import { formatCurrency } from '../../lib/format';

interface AddBudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({ isOpen, onClose }) => {
    const { updateBudget, currency, accounts } = useBudget();
    const [category, setCategory] = useState<Category>(EXPENSE_CATEGORIES[0]);
    const [limit, setLimit] = useState('');
    const [accountId, setAccountId] = useState<string>('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const accountIcons: Record<string, any> = {
        checking: CreditCard,
        savings: Landmark,
        cash: Banknote,
        other: Wallet
    };

    const accountOptions = [
        { label: 'Tous les comptes (Global)', value: '' },
        ...accounts.map(acc => ({
            label: acc.name,
            value: acc.id,
            subLabel: formatCurrency(acc.balance, currency),
            icon: accountIcons[acc.type] || Wallet
        }))
    ];

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numLimit = parseFloat(limit);
        if (numLimit > 0) {
            updateBudget(category, numLimit, accountId || undefined);
            onClose();
            setLimit('');
            setAccountId('');
            setIsDropdownOpen(false);
        }
    };

    const selectedAccount = accountId ? accounts.find(a => a.id === accountId) : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="clay-card w-full max-w-md p-8 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[95vh] custom-scrollbar">
                <div className="flex justify-between items-start mb-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-lime-500 rounded-2xl flex items-center justify-center text-black shadow-xl shadow-lime-500/20 transition-transform hover:rotate-12">
                                <Target className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Configuration</h3>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Strategic <span className="text-lime-600 dark:text-lime-400">Budget</span></h2>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">Secteur d'Allocation</label>

                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full p-6 bg-white dark:bg-black border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] text-slate-800 dark:text-white font-black text-xl flex items-center justify-between group transition-all hover:border-lime-500/30 shadow-sm"
                            >
                                <span className="flex items-center gap-3 truncate">
                                    <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse shrink-0"></div>
                                    {category}
                                </span>
                                <svg
                                    className={`w-6 h-6 text-slate-300 group-hover:text-lime-500 transition-transform duration-500 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                                >
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-4 z-[100] bg-white/90 dark:bg-black/90 backdrop-blur-3xl border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] p-3 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-black/5">
                                    <div className="grid grid-cols-1 gap-1 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                                        {EXPENSE_CATEGORIES.map((c: string) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => {
                                                    setCategory(c as Category);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full text-left p-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-between group/opt ${category === c
                                                    ? 'bg-lime-500 text-black shadow-xl shadow-lime-500/20 translate-x-2'
                                                    : 'text-slate-400 hover:bg-white dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white hover:translate-x-1'
                                                    }`}
                                            >
                                                {c}
                                                {category === c && <Check className="w-4 h-4" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <SearchableDropdown
                                label="Compte Concerné (Optionnel)"
                                options={accountOptions}
                                value={accountId}
                                onChange={setAccountId}
                                placeholder="Tous les comptes (Global)"
                                showSearch={accounts.length > 5}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">Plafond Capital ({currency})</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={limit}
                                    onChange={(e) => setLimit(e.target.value)}
                                    placeholder="000,00"
                                    className="w-full p-6 bg-white dark:bg-black/50 border-2 border-transparent focus:border-lime-500/30 rounded-[2.5rem] text-slate-900 dark:text-white font-black text-5xl tracking-tighter shadow-inner outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-800 text-center"
                                    required
                                />
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-lime-500/20 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-1000"></div>
                            </div>
                        </div>
                    </div>

                    {/* Strategic Intel Section */}
                    <div className="p-6 bg-lime-500/[0.03] dark:bg-lime-500/5 rounded-[2.5rem] border border-lime-500/10 space-y-4">
                        <div className="flex items-center gap-3">
                            <BrainCircuit className="w-5 h-5 text-lime-600 dark:text-lime-400" />
                            <span className="text-[9px] font-black text-lime-600 dark:text-lime-400 uppercase tracking-[0.3em]">Strategic Intel</span>
                        </div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">
                            Un budget de <span className="text-slate-900 dark:text-white">{limit || '0'} {currency}</span> pour <span className="text-slate-900 dark:text-white">{category}</span> {accountId ? `sur le compte ${selectedAccount?.name}` : 'globalement'} sera analysé.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="clay-button-primary w-full py-6 rounded-[2rem] flex items-center justify-center gap-4 text-xl font-black shadow-2xl hover:scale-[1.02] active:scale-95 transition-all group"
                    >
                        <div className="p-2 bg-black/10 rounded-xl group-hover:rotate-12 transition-transform">
                            <Target className="w-6 h-6" />
                        </div>
                        DÉPLOIEMENT
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddBudgetModal;
