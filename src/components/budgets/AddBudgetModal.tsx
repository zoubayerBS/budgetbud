import React, { useState } from 'react';
import { X, Check, Target } from 'lucide-react';
import { EXPENSE_CATEGORIES, type Category } from '../../types';
import { useBudget } from '../../context/BudgetContext';

interface AddBudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({ isOpen, onClose }) => {
    const { updateBudget, currency } = useBudget();
    const [category, setCategory] = useState<Category>(EXPENSE_CATEGORIES[0]);
    const [limit, setLimit] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numLimit = parseFloat(limit);
        if (numLimit > 0) {
            updateBudget(category, numLimit);
            onClose();
            setLimit('');
            setIsDropdownOpen(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="clay-card w-full max-w-md p-8 animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                            <Target className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Nouveau Budget</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Catégorie</label>

                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl text-slate-800 dark:text-white font-black text-lg shadow-inner flex items-center justify-between group transition-all"
                        >
                            <span>{category}</span>
                            <svg
                                className={`w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                            >
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-3 z-50 clay-card border-white/50 backdrop-blur-2xl p-2 max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                                {EXPENSE_CATEGORIES.map((c: string) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => {
                                            setCategory(c as Category);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full text-left p-4 rounded-xl font-bold transition-all ${category === c
                                            ? 'bg-blue-500 text-white shadow-lg'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                            }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Limite Mensuelle ({currency === 'EUR' ? '€' : '$'})</label>
                        <input
                            type="number"
                            step="0.01"
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            placeholder="0.00"
                            className="w-full p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl text-slate-800 dark:text-white font-black text-2xl shadow-inner outline-none border-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                            autoFocus
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="clay-button-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-black shadow-xl shadow-blue-500/30"
                    >
                        <Check className="w-6 h-6" /> Créer le Budget
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddBudgetModal;
