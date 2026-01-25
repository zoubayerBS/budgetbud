
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { addDays, addWeeks, addMonths, addYears, isBefore, isSameDay, parseISO, format } from 'date-fns';
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(cors());
app.use(morgan('dev')); // Log requests

const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_zXATiY0Bt9vH@ep-super-bar-ahzmhpl6-pooler.c-3.us-east-1.aws.neon.tech/budgetdb?sslmode=require&channel_binding=require',
    ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

// Middleware to extract User ID from Neon Auth session
const getUserId = (req: any) => {
    return req.headers['x-user-id'] || '00000000-0000-0000-0000-000000000000';
};

// Auto-initialize Schema
const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS recurring_templates (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id TEXT NOT NULL,
                amount DECIMAL(12,2) NOT NULL,
                type TEXT NOT NULL,
                category TEXT NOT NULL,
                frequency TEXT NOT NULL,
                start_date DATE NOT NULL,
                last_processed DATE,
                note TEXT,
                active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("DB Schema Initialized");
    } catch (err) {
        console.error("DB Init Error:", err);
    }
};
initDB();

const authenticateToken = (req: any, res: any, next: any) => {
    next();
};

// Recurring Templates Routes
app.get('/api/recurring', authenticateToken, async (req: any, res) => {
    const userId = getUserId(req);
    try {
        const result = await pool.query('SELECT * FROM recurring_templates WHERE user_id = $1 AND active = TRUE', [userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching recurring templates' });
    }
});

app.post('/api/recurring', authenticateToken, async (req: any, res) => {
    const userId = getUserId(req);
    const { amount, type, category, frequency, start_date, note } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO recurring_templates (user_id, amount, type, category, frequency, start_date, note) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [userId, amount, type, category, frequency, start_date, note]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error creating recurring template' });
    }
});

app.delete('/api/recurring/:id', authenticateToken, async (req: any, res) => {
    const userId = getUserId(req);
    try {
        await pool.query('UPDATE recurring_templates SET active = FALSE WHERE id = $1 AND user_id = $2', [req.params.id, userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error disabling recurring template' });
    }
});

const processRecurrences = async (userId: string) => {
    try {
        const templates = await pool.query('SELECT * FROM recurring_templates WHERE user_id = $1 AND active = TRUE', [userId]);
        const today = new Date();

        for (const t of templates.rows) {
            let lastDate = t.last_processed ? new Date(t.last_processed) : new Date(t.start_date);
            let nextDate = lastDate;

            // Shift to first occurrence if lastDate was processed
            if (t.last_processed) {
                if (t.frequency === 'daily') nextDate = addDays(lastDate, 1);
                else if (t.frequency === 'weekly') nextDate = addWeeks(lastDate, 1);
                else if (t.frequency === 'monthly') nextDate = addMonths(lastDate, 1);
                else if (t.frequency === 'yearly') nextDate = addYears(lastDate, 1);
            }

            while (isBefore(nextDate, today) || isSameDay(nextDate, today)) {
                // Insert transaction
                await pool.query(
                    'INSERT INTO transactions (user_id, amount, type, category, date, note) VALUES ($1, $2, $3, $4, $5, $6)',
                    [userId, t.amount, t.type, t.category, format(nextDate, 'yyyy-MM-dd'), `${t.note || ''} (Auto)`]
                );

                // Update template
                await pool.query(
                    'UPDATE recurring_templates SET last_processed = $1 WHERE id = $2',
                    [format(nextDate, 'yyyy-MM-dd'), t.id]
                );

                // Calc next
                if (t.frequency === 'daily') nextDate = addDays(nextDate, 1);
                else if (t.frequency === 'weekly') nextDate = addWeeks(nextDate, 1);
                else if (t.frequency === 'monthly') nextDate = addMonths(nextDate, 1);
                else if (t.frequency === 'yearly') nextDate = addYears(nextDate, 1);
            }
        }
    } catch (err) {
        console.error("Sync Recurrence Error:", err);
    }
};

app.get('/api/transactions', authenticateToken, async (req: any, res) => {
    const userId = getUserId(req);
    try {
        await processRecurrences(userId);
        const result = await pool.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC', [userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching transactions' });
    }
});

app.post('/api/transactions', authenticateToken, async (req: any, res) => {
    const userId = getUserId(req);
    const { amount, type, category, date, note } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO transactions (user_id, amount, type, category, date, note) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, amount, type, category, date, note]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error adding transaction' });
    }
});

app.delete('/api/transactions/:id', authenticateToken, async (req: any, res) => {
    const userId = getUserId(req);
    try {
        await pool.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [req.params.id, userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting transaction' });
    }
});

// Budgets
app.get('/api/budgets', authenticateToken, async (req: any, res) => {
    const userId = getUserId(req);
    try {
        const result = await pool.query('SELECT * FROM budgets WHERE user_id = $1', [userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching budgets' });
    }
});

app.post('/api/budgets', authenticateToken, async (req: any, res) => {
    const userId = getUserId(req);
    const { category, limit_amount } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO budgets (user_id, category, limit_amount) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (user_id, category) 
             DO UPDATE SET limit_amount = $3 
             RETURNING *`,
            [userId, category, limit_amount]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error saving budget' });
    }
});

// For local development, use server-local.ts
export default app;
