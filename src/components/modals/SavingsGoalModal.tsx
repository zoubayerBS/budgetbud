import React, { useState, useEffect } from 'react';
import { useBudget } from '../../context/BudgetContext';
import type { SavingsGoal, Category } from '../../types';
import { X, Target, Info, Calendar } from 'lucide-react';
import { CATEGORIES } from '../../types';

interface SavingsGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    goal?: SavingsGoal;
}

const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({ isOpen, onClose, goal }) => {
    const { addSavingsGoal, updateSavingsGoal, currency } = useBudget();

    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [category, setCategory] = useState<Category | ''>('');
    const [deadline, setDeadline] = useState('');

    useEffect(() => {
        if (goal) {
            setName(goal.name);
            setTargetAmount(goal.target_amount.toString());
            setCurrentAmount(goal.current_amount.toString());
            setCategory((goal.category as Category) || '');
            setDeadline(goal.deadline ? goal.deadline.split('T')[0] : '');
        } else {
            setName('');
            setTargetAmount('');
            setCurrentAmount('0');
            setCategory('');
            setDeadline('');
        }
    }, [goal, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const goalData: Omit<SavingsGoal, 'id'> = {
            name,
            target_amount: parseFloat(targetAmount) || 0,
            current_amount: parseFloat(currentAmount) || 0,
            category: category || undefined,
            deadline: deadline || undefined,
        };

        if (goal) {
            await updateSavingsGoal({ ...goalData, id: goal.id });
        } else {
            await addSavingsGoal(goalData);
        }

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
                <div className="p-10">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                                <Target className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {goal ? 'Modifier l\'objectif' : 'Nouvel Objectif'}
                                </h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Épargne Stratégique</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            {/* Name Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Nom du projet</label>
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ex: Voyage au Japon, Nouvelle Voiture..."
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-800 dark:text-white"
                                />
                            </div>

                            {/* Amount Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Montant Cible ({currency})</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={targetAmount}
                                        onChange={(e) => setTargetAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-black text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Déjà Épargné</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={currentAmount}
                                        onChange={(e) => setCurrentAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-black text-slate-600 dark:text-slate-300 shadow-inner"
                                    />
                                </div>
                            </div>

                            {/* Settings Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Date Limite (Optionnel)</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        <input
                                            type="date"
                                            value={deadline}
                                            onChange={(e) => setDeadline(e.target.value)}
                                            className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-800 dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Catégorie</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as Category)}
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-800 dark:text-white appearance-none"
                                    >
                                        <option value="">Sélectionner...</option>
                                        {CATEGORIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center gap-4">
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex-1 border border-indigo-100 dark:border-indigo-500/20">
                                <div className="flex items-start gap-3">
                                    <Info className="w-4 h-4 text-indigo-500 mt-0.5" />
                                    <p className="text-[10px] font-bold text-indigo-600/80 dark:text-indigo-400 leading-relaxed">
                                        Fixer une date limite vous aide à maintenir votre discipline financière et à visualiser votre succès.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all shrink-0"
                            >
                                {goal ? 'Mettre à jour' : 'Confirmer le projet'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SavingsGoalModal;
