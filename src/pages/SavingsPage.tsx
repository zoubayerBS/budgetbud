import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from '../lib/format';
import { Target, Plus, Trash2, Edit3, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import SavingsGoalModal from '../components/modals/SavingsGoalModal';
import AlertModal from '../components/common/AlertModal';
import type { SavingsGoal } from '../types';

const Savings: React.FC = () => {
    const { savingsGoals, deleteSavingsGoal, currency } = useBudget();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<SavingsGoal | undefined>(undefined);
    const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null);

    const totalTarget = savingsGoals.reduce((sum, g) => sum + g.target_amount, 0);
    const totalCurrent = savingsGoals.reduce((sum, g) => sum + g.current_amount, 0);
    const globalProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

    const handleAdd = () => {
        setEditingGoal(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (goal: SavingsGoal) => {
        setEditingGoal(goal);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 p-4 max-w-6xl mx-auto pb-20">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20">
                            <Target className="w-5 h-5" />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                            Objectifs <span className="text-slate-400 font-medium">d'Épargne</span>
                        </h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg lg:max-w-md">
                        Planifiez l'avenir en suivant vos progrès vers vos ambitions financières.
                    </p>
                </div>

                <button
                    onClick={handleAdd}
                    className="flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-[1.5rem] font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/5"
                >
                    <Plus className="w-5 h-5" />
                    <span>Créer un objectif</span>
                </button>
            </header>

            {/* Global Stats Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Cible</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(totalTarget, currency)}</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Épargne Actuelle</p>
                    <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(totalCurrent, currency)}</h3>
                </div>
                <div className="bg-slate-900 dark:bg-white p-8 rounded-[2.5rem] border-none shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-[40px]"></div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 relative z-10">Progression Globale</p>
                    <div className="flex items-end gap-3 relative z-10">
                        <h3 className="text-5xl font-black text-white dark:text-slate-900 leading-none">{Math.round(globalProgress)}%</h3>
                        <TrendingUp className="w-6 h-6 text-emerald-500 mb-1" />
                    </div>
                </div>
            </div>

            {/* Goal Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Vos Projets</h3>
                    <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                        {savingsGoals.length} Objectifs
                    </span>
                </div>

                {savingsGoals.length === 0 ? (
                    <div className="text-center py-24 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="max-w-xs mx-auto space-y-6">
                            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto text-indigo-500">
                                <Target className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-black text-slate-800 dark:text-white">Aucun objectif défini</h4>
                                <p className="text-slate-500 font-bold text-sm leading-relaxed">
                                    Commencez à planifier vos rêves dès aujourd'hui. Chaque grand projet commence par un premier pas.
                                </p>
                            </div>
                            <button
                                onClick={handleAdd}
                                className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all"
                            >
                                Créer mon premier objectif
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {savingsGoals.map(goal => {
                            const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
                            const isCompleted = progress >= 100;

                            return (
                                <div key={goal.id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[3rem] hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all duration-500 flex flex-col justify-between h-full overflow-hidden">
                                    {/* Glass progress background */}
                                    <div
                                        className="absolute inset-0 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05] transition-all duration-1000 origin-left"
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    ></div>

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{goal.name}</h4>
                                                    {isCompleted && (
                                                        <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ring-1 ring-emerald-500/20">Atteint</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                                            {goal.deadline ? new Date(goal.deadline).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'Indéfini'}
                                                        </span>
                                                    </div>
                                                    {goal.category && (
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{goal.category}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(goal)}
                                                    className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setGoalToDelete(goal)}
                                                    className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actuel</p>
                                                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">
                                                        {formatCurrency(goal.current_amount, currency)}
                                                    </p>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Cible</p>
                                                    <p className="text-lg font-black text-slate-400 dark:text-slate-500 lining-nums leading-none">
                                                        {formatCurrency(goal.target_amount, currency)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="relative h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1 shadow-inner">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-1000 shadow-lg",
                                                        isCompleted ? "bg-emerald-500 shadow-emerald-500/20" : "bg-gradient-to-r from-indigo-500 to-blue-500 shadow-indigo-500/20"
                                                    )}
                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                ></div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compteur de réussite</p>
                                                <p className={cn(
                                                    "text-sm font-black",
                                                    isCompleted ? "text-emerald-500" : "text-indigo-500"
                                                )}>{Math.round(progress)}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    {isCompleted && (
                                        <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <SavingsGoalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                goal={editingGoal}
            />

            <AlertModal
                isOpen={!!goalToDelete}
                onClose={() => setGoalToDelete(null)}
                onConfirm={() => {
                    if (goalToDelete) deleteSavingsGoal(goalToDelete.id);
                    setGoalToDelete(null);
                }}
                title="Supprimer l'objectif"
                message={`Êtes-vous sûr de vouloir supprimer "${goalToDelete?.name}" ? Toutes les données de progression seront perdues.`}
                type="error"
                confirmText="Supprimer"
                cancelText="Annuler"
            />
        </div>
    );
};

export default Savings;
