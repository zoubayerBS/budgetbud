import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../lib/format';
import { Wallet, Plus, Trash2, CreditCard, Landmark, Banknote, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Account } from '../../types';

const accountIcons: Record<string, any> = {
    checking: CreditCard,
    savings: Landmark,
    cash: Banknote,
    other: Wallet
};

const AccountsList: React.FC = () => {
    const { accounts, currency, addAccount, deleteAccount } = useBudget();
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<Account['type']>('checking');
    const [newBalance, setNewBalance] = useState('');

    const handleAdd = async () => {
        if (!newName) return;
        await addAccount({
            name: newName,
            type: newType,
            balance: Number(newBalance) || 0
        });
        setIsAdding(false);
        setNewName('');
        setNewBalance('');
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-5 bg-lime-500 rounded-full"></div>
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Mes Comptes</h3>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-2 bg-lime-500/10 text-lime-600 dark:text-lime-400 rounded-full hover:bg-lime-500 hover:text-black transition-all"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {isAdding && (
                <div className="p-5 bg-white dark:bg-white/5 border border-lime-500/20 rounded-[2rem] space-y-4 animate-in slide-in-from-top-4">
                    <input
                        type="text"
                        placeholder="Nom du compte (ex: Attijari...)"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-black rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-sm font-bold"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        {(['checking', 'savings', 'cash', 'other'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setNewType(t)}
                                className={cn(
                                    "py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    newType === t ? "bg-lime-500 text-black" : "bg-slate-100 dark:bg-white/5 text-slate-400"
                                )}
                            >
                                {t === 'checking' ? 'Courant' : t === 'savings' ? 'Épargne' : t === 'cash' ? 'Espèces' : 'Autre'}
                            </button>
                        ))}
                    </div>
                    <input
                        type="number"
                        placeholder="Solde initial"
                        value={newBalance}
                        onChange={(e) => setNewBalance(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-black rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-sm font-bold"
                    />
                    <button
                        onClick={handleAdd}
                        className="w-full py-3 bg-slate-900 dark:bg-white dark:text-black text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg"
                    >
                        Confirmer
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {accounts.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <Sparkles className="w-8 h-8 text-lime-500 mx-auto mb-3 opacity-20" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucun compte actif</p>
                    </div>
                ) : (
                    accounts.map(acc => {
                        const Icon = accountIcons[acc.type] || Wallet;
                        return (
                            <div
                                key={acc.id}
                                className="group relative p-4 flex items-center justify-between bg-white dark:bg-white/5 border border-transparent hover:border-lime-500/20 rounded-3xl transition-all hover:shadow-xl hover:shadow-lime-500/5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-lime-500 transition-colors">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-800 dark:text-white leading-tight">{acc.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">
                                            {acc.type === 'checking' ? 'Compte Courant' : acc.type === 'savings' ? 'Compte d\'épargne' : acc.type === 'cash' ? 'Encaisse / Cash' : 'Autre Actif'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <span className="block text-sm font-black text-slate-900 dark:text-white tracking-tighter">
                                            {formatCurrency(acc.balance, currency)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => deleteAccount(acc.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default AccountsList;
