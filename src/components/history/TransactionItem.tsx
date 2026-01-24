import React from 'react';
import type { Transaction } from '../../types';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, formatDate } from '../../lib/format';
import { Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import AlertModal from '../common/AlertModal';

interface TransactionItemProps {
    transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
    const { deleteTransaction, currency } = useBudget();
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const isIncome = transaction.type === 'income';

    return (
        <>
            <div className="clay-card flex items-center justify-between p-6 hover:translate-x-2 transition-all duration-300 group mb-4 cursor-default">
                <div className="flex items-center gap-6">
                    <div className={cn(
                        "w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-inner transition-transform group-hover:scale-110",
                        isIncome ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : "bg-red-100 text-red-600 dark:bg-red-900/30"
                    )}>
                        {isIncome ? <ArrowUpRight className="w-7 h-7" /> : <ArrowDownLeft className="w-7 h-7" />}
                    </div>
                    <div>
                        <h4 className="font-black text-slate-800 dark:text-white text-lg tracking-tight">{transaction.category}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-400 capitalize">{formatDate(transaction.date)}</span>
                            {transaction.note && <span className="text-xs font-bold text-slate-300">•</span>}
                            {transaction.note && <span className="text-xs font-medium text-slate-500 italic max-w-[150px] truncate">{transaction.note}</span>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <span className={cn(
                        "font-black text-xl tracking-tight",
                        isIncome ? "text-emerald-600" : "text-slate-700 dark:text-slate-200"
                    )}>
                        {isIncome ? '+' : '-'} {formatCurrency(transaction.amount, currency)}
                    </span>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-2xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm hover:shadow-lg"
                        aria-label="Supprimer"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <AlertModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={() => deleteTransaction(transaction.id)}
                title="Supprimer ?"
                message={`Voulez-vous vraiment supprimer cette transaction de ${formatCurrency(transaction.amount, currency)} ?`}
                type="error"
                confirmText="Supprimer"
                cancelText="Annuler"
            />
        </>
    );
};

export default TransactionItem;
