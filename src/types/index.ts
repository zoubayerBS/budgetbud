export type TransactionType = 'income' | 'expense';

export interface Transaction {
    id: string;
    amount: number;
    type: TransactionType;
    category: string;
    date: string; // ISO string
    note?: string;
}

export interface Budget {
    category: Category;
    limit: number;
}

export type Currency = 'EUR' | 'USD' | 'CHF' | 'CAD' | 'TND';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTemplate {
    id: string;
    amount: number;
    type: TransactionType;
    category: string;
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
