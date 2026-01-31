import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from '../lib/format';
import { Target, Plus, Trash2, Edit3, TrendingUp, Calendar, Sparkles, Activity } from 'lucide-react';
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
        <div className="space-y-10 animate-in fade-in duration-1000 p-2 md:p-4 max-w-[1400px] mx-auto pb-24">

            {/* Header: Cinematic Status Bar */}
            {/* Header: Cinematic Status Bar */}
            <div className="flex flex-col md:flex-row items-end justify-between gap-6 px-2">
                <div className="space-y-1 text-center md:text-left">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                        <Sparkles className="w-5 h-5 text-lime-500 animate-pulse" />
                        <h1 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Mes Projets</h1>
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                        Épargne <span className="text-lime-600 dark:text-lime-400">Stratégie</span>
                    </h2>
                </div>

                <button
                    onClick={handleAdd}
                    className="group flex items-center gap-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-900/20 dark:shadow-white/5"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                    <span>Nouveau Projet</span>
                </button>
            </div>

            {/* Matrix Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                {/* 1. Global Vision: Immersive Hero (8 cols) */}
                <div className="md:col-span-8 md:row-span-2 spatial-card bg-gradient-to-br from-slate-900 via-black to-slate-900 p-12 relative overflow-hidden group min-h-[400px] flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lime-500/10 rounded-full -mr-32 -mt-32 blur-[120px] group-hover:bg-lime-500/20 transition-all duration-1000"></div>

                    <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-2 h-2 bg-lime-400 rounded-full shadow-[0_0_10px_rgba(217,255,77,0.8)]"></div>
                            <p className="text-lime-200/50 font-black uppercase tracking-[0.2em] text-[10px]">Progression Totale</p>
                        </div>
                        <h3 className="text-8xl md:text-9xl font-black text-white tracking-tighter mb-4 transition-all duration-700 group-hover:scale-105 origin-left">
                            {Math.round(globalProgress)}<span className="text-lime-400">%</span>
                        </h3>
                        <p className="text-lime-200/40 font-bold text-lg max-w-sm">
                            Vous avez déjà économisé <span className="text-white">{formatCurrency(totalCurrent, currency)}</span> sur un objectif de {formatCurrency(totalTarget, currency)}.
                        </p>
                    </div>

                    <div className="relative z-10 w-full mt-10">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-[10px] font-black text-lime-200/50 uppercase tracking-widest">Épargne actuelle</span>
                            <span className="text-xs font-black text-white">{formatCurrency(totalCurrent, currency)}</span>
                        </div>
                        <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 shadow-inner border border-white/10 backdrop-blur-xl">
                            <div
                                className="h-full bg-gradient-to-r from-lime-500 via-lime-400 to-lime-300 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(217,255,77,0.5)]"
                                style={{ width: `${Math.min(globalProgress, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* 2. Tactical Metrics: Stats Cards (4 cols) */}
                <div className="md:col-span-4 grid grid-cols-1 gap-6">
                    <div className="bento-tile bg-white dark:bg-black/40 p-8 flex flex-col justify-center gap-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-lime-500">
                            <Activity className="w-16 h-16" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Objectif total</p>
                        <h4 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">
                            {formatCurrency(totalTarget, currency)}
                        </h4>
                    </div>

                    <div className="bento-tile bg-white dark:bg-black/40 p-8 flex flex-col justify-center gap-4 border-l-4 border-lime-500/20 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-lime-500">
                            <TrendingUp className="w-16 h-16" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Épargne réelle</p>
                        <h4 className="text-4xl font-black text-lime-600 dark:text-lime-400 tracking-tighter">
                            {formatCurrency(totalCurrent, currency)}
                        </h4>
                    </div>
                </div>

                {/* Vertical Stream: Projects (12 cols) */}
                <div className="md:col-span-12 space-y-8 mt-4">
                    <div className="flex items-center gap-4 px-2">
                        <div className="w-1.5 h-6 bg-slate-900 dark:bg-white rounded-full"></div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Liste des projets</h3>
                    </div>

                    {savingsGoals.length === 0 ? (
                        <div className="text-center py-32 bento-tile flex flex-col items-center justify-center gap-8 group">
                            <div className="executive-card p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-slate-200 dark:border-white/10 group hover:border-lime-500/50 transition-all duration-500">
                                <Target className="w-12 h-12" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">Aucun objectif</h4>
                                <p className="text-slate-500 font-bold text-sm max-w-xs mx-auto italic">Commencez à économiser pour vos projets dès aujourd'hui.</p>
                            </div>
                            <button onClick={handleAdd} className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Ajouter</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {savingsGoals.map((goal, idx) => {
                                const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
                                const isCompleted = progress >= 100;

                                return (
                                    <div
                                        key={goal.id}
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                        className="bento-tile group relative overflow-hidden animate-in slide-in-from-bottom-6 duration-1000 p-8 flex flex-col justify-between h-[450px]"
                                    >
                                        <div className="absolute inset-0 bg-lime-500/5 dark:bg-lime-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                        <div>
                                            <div className="flex justify-between items-start mb-10">
                                                <div className="w-14 h-14 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                                    <Target className={cn("w-6 h-6", isCompleted ? "text-lime-500" : "text-lime-500")} />
                                                </div>
                                                <div className="flex gap-2 relative z-20">
                                                    <button onClick={() => handleEdit(goal)} className="p-3 bg-white dark:bg-white/5 rounded-xl hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-sm">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setGoalToDelete(goal)} className="p-3 bg-white dark:bg-white/5 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter truncate leading-tight">{goal.name}</h4>
                                                    {isCompleted && (
                                                        <div className="bg-lime-500/20 text-lime-500 p-1 rounded-full"><Plus className="w-3 h-3 rotate-45" /></div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/5">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                            {goal.deadline ? new Date(goal.deadline).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'Indéfini'}
                                                        </span>
                                                    </div>
                                                    {goal.category && <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">{goal.category}</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-8 relative z-10 mt-auto pt-6">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Économisé</p>
                                                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                                                        {formatCurrency(goal.current_amount, currency)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Cible</p>
                                                    <p className="text-lg font-black text-slate-300 dark:text-slate-500 lining-nums leading-none">
                                                        {formatCurrency(goal.target_amount, currency)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="h-3 bg-white dark:bg-white/5 rounded-full overflow-hidden p-0.5">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-1000",
                                                            isCompleted ? "bg-lime-500" : "bg-gradient-to-r from-lime-600 via-lime-500 to-lime-400"
                                                        )}
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{isCompleted ? 'Terminé' : 'Progrès'}</span>
                                                    <span className={cn("text-xs font-black", isCompleted ? "text-lime-500" : "text-lime-500")}>{Math.round(progress)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
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
                message={`Voulez-vous supprimer "${goalToDelete?.name}" ?`}
                type="error"
                confirmText="Supprimer"
                cancelText="Annuler"
            />
        </div>
    );
};

export default Savings;
