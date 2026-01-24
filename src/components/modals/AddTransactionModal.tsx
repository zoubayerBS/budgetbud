import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { CATEGORIES } from '../../types';
import type { Category, TransactionType, RecurrenceFrequency } from '../../types';
import {
    X,
    Plus,
    Repeat,
    Calendar,
    CreditCard,
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
    CheckCircle2
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
    const [category, setCategory] = useState<Category>(CATEGORIES[0]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

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
                    frequency,
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
            }, 1500);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setIsSuccess(false);
        setStep(1);
        setAmount('');
        setNote('');
        closeAddModal();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500"
                onClick={resetAndClose}
            ></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-4xl h-full max-h-[85vh] md:max-h-[800px] flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">

                {/* Left Side: Real-time Preview Card */}
                <div className="md:w-1/3 p-8 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500 rounded-full blur-[100px]"></div>
                    </div>

                    <div className="relative z-10 w-full">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 text-center">Aperçu Quantum</p>

                        <div className={cn(
                            "clay-card p-6 flex flex-col justify-between transition-all duration-500 scale-90 group",
                            type === 'income' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
                        )}>
                            <div className="flex justify-between items-start">
                                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                                    {React.createElement(categoryIcons[category] || Sparkles, { className: "w-8 h-8" })}
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</p>
                                    <p className="text-xs font-bold leading-none mt-1">
                                        {isRecurring ? 'Récurrent ∞' : 'Unique •'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-black mb-1 opacity-90">{category}</h3>
                                <p className="text-xs font-bold opacity-60 truncate max-w-[180px]">{note || 'Sans note'}</p>
                            </div>

                            <div className="mt-8">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Montant Estimé</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black tracking-tighter">
                                        {amount || '0'}
                                    </span>
                                    <span className="text-xl font-bold opacity-70">{currency}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 space-y-4">
                            <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500 justify-center">
                                <Calendar className="w-5 h-5" />
                                <span className="font-bold text-sm tracking-tight">{date}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form Construction */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-white dark:bg-slate-900 scrollbar-hide">
                    <button
                        onClick={resetAndClose}
                        className="absolute top-8 right-8 p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-50 bg-slate-50 dark:bg-slate-800 rounded-2xl"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {isSuccess ? (
                        <div className="h-full flex flex-col items-center justify-center animate-in zoom-in-50 duration-500">
                            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-glow effect-pulse">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Sync Réussie !</h3>
                            <p className="text-slate-400 font-bold">Transaction cryptée et enregistrée.</p>
                        </div>
                    ) : (
                        <div className="space-y-10 py-4">
                            <div className="flex items-end justify-between">
                                <div>
                                    <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">Entrée Flux</h2>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1 italic">Quantum Engine v2.0</p>
                                </div>
                            </div>

                            {/* Phase 1: Basics */}
                            <div className="space-y-8 animate-in slide-in-from-right-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setType('expense')}
                                        className={cn(
                                            "p-5 rounded-3xl font-black transition-all flex items-center justify-center gap-2",
                                            type === 'expense' ? "clay-button bg-red-500 text-white shadow-red-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                        )}
                                    >
                                        Dépense
                                    </button>
                                    <button
                                        onClick={() => setType('income')}
                                        className={cn(
                                            "p-5 rounded-3xl font-black transition-all flex items-center justify-center gap-2",
                                            type === 'income' ? "clay-button bg-emerald-500 text-white shadow-emerald-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                        )}
                                    >
                                        Revenu
                                    </button>
                                </div>

                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
                                        <CreditCard className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        autoFocus
                                        className="w-full pl-28 pr-10 py-10 bg-slate-50 dark:bg-slate-950 border-none rounded-[2rem] text-5xl font-black text-slate-800 dark:text-white shadow-inner focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
                                    />
                                    <div className="absolute right-10 top-1/2 -translate-y-1/2 font-black text-slate-300 text-2xl">{currency}</div>
                                </div>

                                {/* Category Selection Grid */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block ml-2">Sélecteur Tactile</label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {CATEGORIES.map(cat => {
                                            const Icon = categoryIcons[cat] || Sparkles;
                                            return (
                                                <button
                                                    key={cat}
                                                    onClick={() => setCategory(cat)}
                                                    className={cn(
                                                        "aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all p-2",
                                                        category === cat
                                                            ? "bg-blue-600 text-white shadow-xl scale-110 ring-4 ring-blue-500/20"
                                                            : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-200"
                                                    )}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    <span className="text-[8px] font-black uppercase text-center leading-none">{cat}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Date & Note */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DatePicker label="Date de Flux" value={date} onChange={setDate} />
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Note (Codée)</label>
                                        <input
                                            type="text"
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="Référence..."
                                            className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border-none outline-none font-bold text-slate-700 dark:text-slate-200 shadow-inner"
                                        />
                                    </div>
                                </div>

                                {/* Automation Toggle */}
                                <div className="clay-card p-6 bg-slate-50 dark:bg-slate-950 border-none shadow-inner flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-3 rounded-xl transition-colors",
                                            isRecurring ? "bg-amber-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                                        )}>
                                            <Repeat className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 dark:text-white leading-none">Canal Récurrent</p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Automatiser le cycle</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsRecurring(!isRecurring)}
                                        className={cn(
                                            "w-12 h-7 rounded-full relative transition-all",
                                            isRecurring ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all",
                                            isRecurring ? "left-6" : "left-1"
                                        )} />
                                    </button>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !amount}
                                    className="w-full clay-button-primary py-6 rounded-[2rem] flex items-center justify-center gap-4 text-xl font-black group shadow-2xl disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Zap className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                            <span>Exécuter Sync</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddTransactionModal;
