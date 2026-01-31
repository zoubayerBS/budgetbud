import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useSession } from '../lib/auth-client';
import type { Transaction, Account, Budget, Category, Currency, RecurringTemplate, SavingsGoal } from '../types';

interface BudgetContextType {
    accounts: Account[];
    transactions: Transaction[];
    budgets: Budget[];
    recurringTemplates: RecurringTemplate[];
    savingsGoals: SavingsGoal[];
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    deleteAccount: (id: string) => Promise<void>;
    addRecurringTemplate: (template: Omit<RecurringTemplate, 'id'>) => Promise<void>;
    addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<void>;
    deleteRecurringTemplate: (id: string) => Promise<void>;
    deleteSavingsGoal: (id: string) => Promise<void>;
    updateBudget: (category: Category, limit: number, accountId?: string) => Promise<void>;
    updateSavingsGoal: (goal: SavingsGoal) => Promise<void>;
    resetAccount: () => Promise<void>;
    refresh: () => Promise<void>;
    isAddModalOpen: boolean;
    openAddModal: () => void;
    closeAddModal: () => void;
    currency: Currency;
    setCurrency: (c: Currency) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    loading: boolean;
    user: any;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { data: session, isPending } = useSession();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [recurringTemplates, setRecurringTemplates] = useState<RecurringTemplate[]>([]);
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currency, setCurrency] = useState<Currency>('TND');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [loading, setLoading] = useState(true);

    const API_URL = '/api';

    // Theme logic
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    // Load Data whenever Auth changes or first load
    useEffect(() => {
        if (!isPending) {
            fetchData();
        }
    }, [isPending, session]);

    // Auto-refresh on window focus
    useEffect(() => {
        const handleFocus = () => {
            if (session) {
                fetchData(false); // Background refresh
            }
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [session]);

    const getHeaders = () => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (session?.user?.id) {
            headers['x-user-id'] = session.user.id;
        }
        return headers;
    };

    const fetchData = async (showLoading = true, retries = 3) => {
        if (showLoading) setLoading(true);
        try {
            const headers = getHeaders();
            const [resTrans, resBudgets, resRecurring, resSavings, resAccounts] = await Promise.all([
                fetch(`${API_URL}/transactions`, { headers }),
                fetch(`${API_URL}/budgets`, { headers }),
                fetch(`${API_URL}/recurring`, { headers }),
                fetch(`${API_URL}/savings`, { headers }),
                fetch(`${API_URL}/accounts`, { headers })
            ]);

            if (resTrans.ok && resBudgets.ok && resRecurring.ok && resSavings.ok && resAccounts.ok) {
                const tData = await resTrans.json();
                const bData = await resBudgets.json();
                const rData = await resRecurring.json();
                const sData = await resSavings.json();
                const aData = await resAccounts.json();

                setTransactions(tData.map((t: any) => ({
                    ...t,
                    amount: parseFloat(t.amount) || 0
                })));

                setAccounts(aData.map((a: any) => ({
                    ...a,
                    balance: parseFloat(a.balance) || 0
                })));

                setBudgets(bData.map((b: any) => ({
                    ...b,
                    limit: parseFloat(b.limit_amount) || 0
                })));

                setRecurringTemplates(rData.map((r: any) => ({
                    ...r,
                    amount: parseFloat(r.amount) || 0
                })));

                setSavingsGoals(sData.map((s: any) => ({
                    ...s,
                    target_amount: parseFloat(s.target_amount) || 0,
                    current_amount: parseFloat(s.current_amount) || 0
                })));
            } else if (retries > 0) {
                throw new Error("Fetch failed");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            if (retries > 0) {
                setTimeout(() => fetchData(showLoading, retries - 1), 2000);
            }
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const refresh = () => fetchData(true);

    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        try {
            const res = await fetch(`${API_URL}/transactions`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(transaction)
            });
            const newT = await res.json();
            setTransactions(prev => [{
                ...newT,
                amount: parseFloat(newT.amount) || 0
            }, ...prev]);
            await fetchData(false); // Update balances
        } catch (err) { console.error(err); }
    };

    const addAccount = async (account: Omit<Account, 'id'>) => {
        try {
            const res = await fetch(`${API_URL}/accounts`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(account)
            });
            const newA = await res.json();
            setAccounts(prev => [{
                ...newA,
                balance: parseFloat(newA.balance) || 0
            }, ...prev]);
        } catch (err) { console.error(err); }
    };

    const deleteAccount = async (id: string) => {
        try {
            await fetch(`${API_URL}/accounts/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            setAccounts(prev => prev.filter(a => a.id !== id));
            await fetchData(false); // Update transactions deleted by cascade
        } catch (err) { console.error(err); }
    };

    const addRecurringTemplate = async (template: Omit<RecurringTemplate, 'id'>) => {
        try {
            const res = await fetch(`${API_URL}/recurring`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(template)
            });
            const newR = await res.json();
            setRecurringTemplates(prev => [{
                ...newR,
                amount: parseFloat(newR.amount) || 0
            }, ...prev]);
            await fetchData(); // Force sync generated transactions
        } catch (err) { console.error(err); }
    };

    const deleteTransaction = async (id: string) => {
        try {
            await fetch(`${API_URL}/transactions/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            setTransactions(prev => prev.filter(t => t.id !== id));
            await fetchData(false); // Revert balances
        } catch (err) { console.error(err); }
    };

    const deleteRecurringTemplate = async (id: string) => {
        try {
            await fetch(`${API_URL}/recurring/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            setRecurringTemplates(prev => prev.filter(t => t.id !== id));
        } catch (err) { console.error(err); }
    };

    const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id'>) => {
        try {
            const res = await fetch(`${API_URL}/savings`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(goal)
            });
            const newG = await res.json();
            setSavingsGoals(prev => [{
                ...newG,
                target_amount: parseFloat(newG.target_amount) || 0,
                current_amount: parseFloat(newG.current_amount) || 0
            }, ...prev]);
        } catch (err) { console.error(err); }
    };

    const deleteSavingsGoal = async (id: string) => {
        try {
            await fetch(`${API_URL}/savings/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            setSavingsGoals(prev => prev.filter(g => g.id !== id));
        } catch (err) { console.error(err); }
    };

    const updateSavingsGoal = async (goal: SavingsGoal) => {
        try {
            const res = await fetch(`${API_URL}/savings`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(goal)
            });
            const updatedG = await res.json();
            setSavingsGoals(prev => prev.map(g => g.id === updatedG.id ? {
                ...updatedG,
                target_amount: parseFloat(updatedG.target_amount) || 0,
                current_amount: parseFloat(updatedG.current_amount) || 0
            } : g));
        } catch (err) { console.error(err); }
    };

    const updateBudget = async (category: Category, limit: number, accountId?: string) => {
        try {
            const res = await fetch(`${API_URL}/budgets`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ category, limit_amount: limit, account_id: accountId })
            });
            const updatedB = await res.json();
            const numericLimit = parseFloat(updatedB.limit_amount) || 0;

            setBudgets(prev => {
                const existing = prev.find(b => b.category === category);
                if (existing) {
                    return prev.map(b => b.category === category ? { ...b, limit: numericLimit } : b);
                } else {
                    return [...prev, { id: updatedB.id, category: updatedB.category, limit: numericLimit }];
                }
            });
            await fetchData();
        } catch (err) { console.error(err); }
    };

    const resetAccount = async () => {
        try {
            const res = await fetch(`${API_URL}/user/reset`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (res.ok) {
                await fetchData();
            }
        } catch (err) { console.error(err); }
    };

    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);

    return (
        <BudgetContext.Provider value={{
            accounts,
            transactions,
            budgets,
            recurringTemplates,
            savingsGoals,
            addTransaction,
            addAccount,
            deleteTransaction,
            deleteAccount,
            addRecurringTemplate,
            addSavingsGoal,
            deleteRecurringTemplate,
            deleteSavingsGoal,
            updateBudget,
            updateSavingsGoal,
            resetAccount,
            refresh,
            isAddModalOpen,
            openAddModal,
            closeAddModal,
            currency,
            setCurrency,
            theme,
            toggleTheme,
            loading,
            user: session?.user
        }}>
            {children}
        </BudgetContext.Provider >
    );
};

export const useBudget = () => {
    const context = useContext(BudgetContext);
    if (context === undefined) {
        throw new Error('useBudget must be used within a BudgetProvider');
    }
    return context;
};
