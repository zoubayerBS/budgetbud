import React from 'react';
import type { Transaction } from '../../types';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, formatDate } from '../../lib/format';
import { Trash2, ArrowUpRight, Receipt, ChevronRight } from 'lucide-react';
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
            <div className="group relative bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-4 sm:p-5 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-black/20 transition-all duration-300 flex items-start sm:items-center justify-between cursor-pointer gap-4">

                <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
                    {/* Minimalist Icon Wrapper */}
                    <div className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 shrink-0",
                        isIncome
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                        {isIncome ? <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" /> : <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white tracking-tight truncate sm:text-lg">
                                {transaction.category}
                            </h4>
                            {!isIncome && (
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-500 rounded-md">
                                    Débit
                                </span>
                            )}
                        </div>
                        <div className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                            <p>{formatDate(transaction.date)}</p>
                            {transaction.note && (
                                <p className="italic mt-1.5 text-slate-500/80 dark:text-slate-400/80 break-words whitespace-normal leading-relaxed max-w-full">
                                    "{transaction.note}"
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-8 ml-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800/50 shrink-0">
                    <div className="text-right">
                        <span className={cn(
                            "block font-black text-lg sm:text-xl tracking-tighter",
                            isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                        )}>
                            {isIncome ? '+' : ''}{formatCurrency(transaction.amount, currency)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsModalOpen(true);
                            }}
                            className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
                    </div>
                </div>
            </div>

            <AlertModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={() => deleteTransaction(transaction.id)}
                title="Supprimer la transaction"
                message={`Cette action est irréversible. Voulez-vous supprimer l'entrée de ${formatCurrency(transaction.amount, currency)} ?`}
                type="error"
                confirmText="Vider"
                cancelText="Garder"
            />
        </>
    );
};

export default TransactionItem;
