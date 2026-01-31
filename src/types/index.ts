export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
    id: string;
    amount: number;
    type: TransactionType;
    category: Category;
    date: string; // ISO string
    note?: string;
    account_id: string;
    target_account_id?: string; // For transfers
}

export interface Account {
    id: string;
    name: string;
    type: 'checking' | 'savings' | 'cash' | 'other';
    balance: number;
    last_updated?: string;
}

export interface Budget {
    id?: string;
    category: Category;
    limit: number;
    account_id?: string; // Optional: specific to an account
}

export type Currency = 'EUR' | 'USD' | 'CHF' | 'CAD' | 'GBP' | 'JPY' | 'AUD' | 'NZD' | 'CNY' | 'INR' | 'SGD' | 'KRW' | 'TND' | 'AED' | 'SAR' | 'ZAR' | 'TRY' | 'BRL' | 'MXN' | 'SEK' | 'NOK' | 'DKK';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTemplate {
    id: string;
    amount: number;
    type: TransactionType;
    category: Category;
    frequency: RecurrenceFrequency;
    start_date: string;
    last_processed?: string;
    note?: string;
}

export const EXPENSE_CATEGORIES = [
    'Alimentation',
    'Transport',
    'Logement',
    'Loisirs',
    'Santé',
    'Vêtements',
    'Shopping',
    'Éducation',
    'Professionnel',
    'Autre'
] as const;

export const INCOME_CATEGORIES = [
    'Salaire',
    'Cadeaux',
    'Freelance',
    'Investissement',
    'Autre'
] as const;

export const CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES] as const;

export interface SavingsGoal {
    id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    category?: string;
    deadline?: string; // ISO string
    created_at?: string; // ISO string
}

export type Category = typeof CATEGORIES[number];
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type IncomeCategory = typeof INCOME_CATEGORIES[number];
