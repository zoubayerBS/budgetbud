import React from 'react';
import type { Transaction } from '../../types';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, formatDate } from '../../lib/format';
import { Trash2, ArrowUpRight, Receipt, Shuffle, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import AlertModal from '../common/AlertModal';

import { useLanguage } from '../../context/LanguageContext';

interface TransactionItemProps {
    transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
    const { deleteTransaction, currency, accounts } = useBudget();
    const { t } = useLanguage();
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const isIncome = transaction.type === 'income';
    const isTransfer = transaction.type === 'transfer';

    const sourceAccount = accounts.find(a => a.id === transaction.account_id);
    const targetAccount = accounts.find(a => a.id === transaction.target_account_id);

    return (
        <>
            <div
                className="group relative bg-white dark:bg-black border border-slate-200/60 dark:border-slate-800/60 p-4 sm:p-5 rounded-[2rem] hover:border-lime-500/50 dark:hover:border-lime-500/30 hover:shadow-2xl hover:shadow-lime-500/10 transition-all duration-500 flex items-center justify-between cursor-pointer gap-3 sm:gap-6"
            >
                {/* Visual Accent */}
                {isIncome && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-lime-500 rounded-r-full"></div>}
                {isTransfer && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>}

                <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
                    <div className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 shrink-0",
                        isIncome
                            ? "bg-lime-500 text-black shadow-lg shadow-lime-500/20"
                            : isTransfer
                                ? "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 shadow-lg shadow-blue-500/5"
                                : "bg-red-500/10 text-red-500 dark:bg-red-500/20 shadow-lg shadow-red-500/5"
                    )}>
                        {isIncome ? <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" /> : isTransfer ? <Shuffle className="w-5 h-5 sm:w-6 sm:h-6" /> : <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-black text-slate-900 dark:text-white tracking-tight truncate text-lg">
                                {isTransfer ? 'Virement Interne' : transaction.category}
                            </h4>
                            {isTransfer ? (
                                <span className="px-2 py-0.5 bg-blue-500/5 dark:bg-blue-500/10 text-[8px] font-black uppercase tracking-[0.2em] text-blue-500/80 rounded-lg">
                                    Neutre
                                </span>
                            ) : !isIncome && (
                                <span className="px-2 py-0.5 bg-red-500/5 dark:bg-red-500/10 text-[8px] font-black uppercase tracking-[0.2em] text-red-500/80 rounded-lg">
                                    Flux Sortant
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {formatDate(transaction.date)}
                            </p>
                            {sourceAccount && (
                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    {sourceAccount.name}
                                    {isTransfer && targetAccount && (
                                        <>
                                            <ArrowRight className="w-2 h-2" />
                                            {targetAccount.name}
                                        </>
                                    )}
                                </span>
                            )}
                        </div>
                        {transaction.note && (
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 italic opacity-60 break-words">
                                {transaction.note}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-6 shrink-0 min-w-[80px] sm:min-w-fit">
                    <div className="text-right w-full">
                        <span className={cn(
                            "block font-black text-lg sm:text-xl tracking-tighter",
                            isIncome ? "text-lime-600 dark:text-lime-400" : isTransfer ? "text-slate-500" : "text-red-600 dark:text-red-400"
                        )}>
                            {isIncome ? '+' : isTransfer ? '' : '-'}{formatCurrency(transaction.amount, currency)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsModalOpen(true);
                            }}
                            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <AlertModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={() => deleteTransaction(transaction.id)}
                title={t('confirmDelete')}
                message={t('confirmDelete')}
                type="error"
                confirmText={t('delete')}
                cancelText={t('cancel')}
            />
        </>
    );
};

export default TransactionItem;
