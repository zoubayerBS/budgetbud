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

export const CATEGORIES = [
    'Alimentation',
    'Transport',
    'Logement',
    'Loisirs',
    'Santé',
    'Vêtements',
    'Shopping',
    'Éducation',
    'Professionnel',
    'Cadeaux',
    'Salaire',
    'Autre'
] as const;

export type Category = typeof CATEGORIES[number];
