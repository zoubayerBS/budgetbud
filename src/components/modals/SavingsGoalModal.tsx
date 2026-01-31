import React, { useState, useEffect } from 'react';
import { useBudget } from '../../context/BudgetContext';
import type { SavingsGoal, Category } from '../../types';
import { X, Target, Info, Calendar, Sparkles, ChevronRight, Check } from 'lucide-react';
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
            <div
                className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-2xl animate-in fade-in duration-700"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-black rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border border-white/10 dark:border-slate-800/50 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 flex flex-col noise-texture">

                {/* Visual Flair: Abstract Orb */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-lime-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="p-10 md:p-14 relative z-10 flex flex-col overflow-y-auto custom-scrollbar">

                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-12">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-lime-500 animate-pulse" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Nouvelle Vision</h3>
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {goal ? 'Éditer le' : 'Créer un'} <span className="text-lime-600 dark:text-lime-400">Projet</span>
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-14 h-14 flex items-center justify-center rounded-[1.5rem] bg-white dark:bg-white/5/50 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:scale-110 active:scale-95 transition-all shadow-inner border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="space-y-8">
                            {/* Project Name: High-Impact Input */}
                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block group-focus-within:text-lime-500 transition-colors">Nom du projet d'avenir</label>
                                <div className="relative">
                                    <Target className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:text-lime-500 transition-colors" />
                                    <input
                                        required
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex: Villa en bord de mer, Nouvelle Tesla..."
                                        className="w-full pl-16 pr-8 py-6 bg-white dark:bg-white/5/20 border border-slate-100 dark:border-slate-800/50 rounded-[2rem] focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none transition-all font-bold text-lg text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 shadow-inner"
                                    />
                                </div>
                            </div>

                            {/* Double Grid: Amounts */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div className="md:col-span-7 space-y-3 group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">Montant Cible ({currency})</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            value={targetAmount}
                                            onChange={(e) => setTargetAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full px-8 py-6 bg-white dark:bg-white/5/20 border border-slate-100 dark:border-slate-800/50 rounded-[2rem] focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none transition-all font-black text-3xl text-slate-900 dark:text-white tracking-tighter shadow-inner"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 font-black">{currency}</div>
                                    </div>
                                </div>
                                <div className="md:col-span-12 space-y-3 group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">Déjà Économisé</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={currentAmount}
                                        onChange={(e) => setCurrentAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-8 py-6 bg-lime-500/[0.03] dark:bg-lime-500/[0.05] border border-lime-500/10 rounded-[2rem] focus:ring-2 focus:ring-lime-500 outline-none transition-all font-black text-2xl text-lime-600 dark:text-lime-400 tracking-tighter"
                                    />
                                </div>
                            </div>

                            {/* Split Grid: Meta */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3 group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block text-center md:text-left">Échéance souhaitée</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:text-lime-500 transition-colors" />
                                        <input
                                            type="date"
                                            value={deadline}
                                            onChange={(e) => setDeadline(e.target.value)}
                                            className="w-full pl-16 pr-8 py-5 bg-white dark:bg-white/5/20 border border-slate-100 dark:border-slate-800/50 rounded-[1.5rem] focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none transition-all font-bold text-slate-800 dark:text-white appearance-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block text-center md:text-left">Catégorie du projet</label>
                                    <div className="relative">
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value as Category)}
                                            className="w-full px-8 py-5 bg-white dark:bg-white/5/20 border border-slate-100 dark:border-slate-800/50 rounded-[1.5rem] focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none transition-all font-bold text-slate-800 dark:text-white appearance-none cursor-pointer"
                                        >
                                            <option value="">Sélectionner...</option>
                                            {CATEGORIES.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600 rotate-90" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary & Actions */}
                        <div className="flex flex-col md:flex-row items-center gap-8 pt-4">
                            <div className="flex-1 flex gap-4 p-6 bg-lime-500/5 dark:bg-lime-500/10 rounded-[2rem] border border-lime-500/10 group hover:bg-lime-500/10 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-lime-500/20 flex items-center justify-center text-lime-600 dark:text-lime-400 shrink-0">
                                    <Info className="w-5 h-5" />
                                </div>
                                <p className="text-[10px] font-bold text-lime-600/80 dark:text-lime-400/80 leading-relaxed uppercase tracking-widest italic">
                                    Épargner régulièrement est la clé du succès. Nous suivrons votre progression en temps réel.
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="w-full md:w-auto px-12 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shrink-0"
                            >
                                {goal ? 'Confirmer les modifs' : 'Lancer le projet'}
                                <Check className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SavingsGoalModal;
