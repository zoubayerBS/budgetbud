import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudget } from '../context/BudgetContext';
import { CATEGORIES } from '../types';
import type { TransactionType, Category, RecurrenceFrequency } from '../types';
import { ArrowLeft, Save, Repeat } from 'lucide-react';
import AlertModal from '../components/common/AlertModal';
import DatePicker from '../components/common/DatePicker';
import Dropdown from '../components/common/Dropdown';

const AddTransaction: React.FC = () => {
    const navigate = useNavigate();
    const { addTransaction, addRecurringTemplate, currency } = useBudget();

    const [type, setType] = useState<TransactionType>('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<Category>(CATEGORIES[0]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || isNaN(Number(amount))) return;

        const amountVal = Number(amount);

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

        setAmount('');
        setNote('');
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-xl mx-auto animate-in slide-in-from-bottom-4 duration-500 p-4">
            <header className="mb-8 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="clay-button p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Nouvelle Transaction</h2>
            </header>

            <form onSubmit={handleSubmit} className="clay-card p-8 space-y-8">

                {/* Type Selector */}
                <div className="flex bg-slate-100 dark:bg-slate-900/50 p-2 rounded-3xl shadow-inner">
                    <button
                        type="button"
                        onClick={() => setType('income')}
                        className={`flex-1 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${type === 'income'
                            ? 'clay-button bg-white text-emerald-600 dark:bg-slate-800 dark:text-emerald-400'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Revenu
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('expense')}
                        className={`flex-1 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${type === 'expense'
                            ? 'clay-button bg-white text-red-600 dark:bg-slate-800 dark:text-red-400'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Dépense
                    </button>
                </div>

                {/* Amount */}
                <div>
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 ml-2">
                        Montant
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-6 pr-16 py-5 bg-slate-50 dark:bg-slate-900 border-none rounded-3xl text-3xl font-extrabold text-slate-800 dark:text-white shadow-inner focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-shadow outline-none"
                            required
                            step="0.01"
                            min="0"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-black">
                            {currency}
                        </div>
                    </div>
                </div>

                {/* Recurrence Toggle */}
                <div className="clay-card p-6 bg-slate-50 dark:bg-slate-900/40 border-none shadow-inner">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl transition-colors ${isRecurring ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                                <Repeat className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 dark:text-white leading-none">Récurrent ?</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Automatiser ce flux</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsRecurring(!isRecurring)}
                            className={`w-14 h-8 rounded-full transition-all relative ${isRecurring ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${isRecurring ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    {isRecurring && (
                        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
                            <Dropdown
                                label="Périodicité"
                                options={[
                                    { label: 'Tous les jours', value: 'daily' },
                                    { label: 'Toutes les semaines', value: 'weekly' },
                                    { label: 'Tous les mois', value: 'monthly' },
                                    { label: 'Tous les ans', value: 'yearly' },
                                ]}
                                value={frequency}
                                onChange={(val) => setFrequency(val as any)}
                            />
                        </div>
                    )}
                </div>

                {/* Category */}
                <div className="relative">
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 ml-2">
                        Catégorie
                    </label>
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-900 border-none rounded-3xl text-lg font-bold text-slate-800 dark:text-white shadow-inner flex items-center justify-between group transition-all"
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
                        <div className="absolute top-full left-0 right-0 mt-4 z-50 clay-card border-white/50 backdrop-blur-2xl p-2 max-h-64 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => {
                                        setCategory(cat);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all ${category === cat
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Date */}
                <DatePicker
                    label="Date"
                    value={date}
                    onChange={setDate}
                />

                {/* Note (Optional) */}
                <div>
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 ml-2">
                        Note (Optionnel)
                    </label>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Ex: Courses Carrefour"
                        className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-900 border-none rounded-3xl text-lg font-bold text-slate-800 dark:text-white shadow-inner focus:ring-4 focus:ring-blue-100 outline-none"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full clay-button-primary py-5 rounded-3xl flex items-center justify-center gap-3 text-lg mt-4 active:scale-95"
                >
                    <Save className="w-6 h-6" />
                    Ajouter la transaction
                </button>

            </form>

            <AlertModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={() => navigate('/history')}
                title="Super ! ✨"
                message="Votre transaction a été enregistrée avec succès. Voulez-vous voir l'historique ?"
                type="confirm"
                confirmText="Voir l'historique"
                cancelText="Rester ici"
            />
        </div>
    );
};

export default AddTransaction;
