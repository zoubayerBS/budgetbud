import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { addDays, addWeeks, addMonths, addYears, isBefore, isSameDay, parseISO, format } from 'date-fns';
import Groq from "groq-sdk";

dotenv.config();

const app = express();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(cors());
app.use(morgan('dev')); // Log requests

const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_zXATiY0Bt9vH@ep-super-bar-ahzmhpl6-pooler.c-3.us-east-1.aws.neon.tech/budgetdb?sslmode=require&channel_binding=require',
    ssl: { rejectUnauthorized: false }
});

const getUserId = (req: any) => {
    // Prioritize header from frontend, then fallback
    return req.headers['x-user-id'] || '00000000-0000-0000-0000-000000000000';
};

const authenticateToken = (req: any, res: any, next: any) => {
    // In this dev setup, we trust the x-user-id header sent by the client context
    const userId = req.headers['x-user-id'];
    if (userId) {
        req.user = { id: userId };
    }
    next();
};

// --- AI Status Endpoint ---
app.get('/api/ai/status', (req, res) => {
    const isConfigured = !!process.env.GROQ_API_KEY;
    res.json({
        status: isConfigured ? 'live' : 'offline',
        engine: 'Groq GPT-OSS 120B',
        version: '1.0.0'
    });
});

// --- Neural Butler Chat Endpoint ---
app.post('/api/ai/chat', authenticateToken, async (req: any, res) => {
    const userId = getUserId(req);
    // console.log("Received Headers:", req.headers); // Debug headers if needed
    const { messages, language } = req.body;

    if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: "AI key not configured" });
    }

    try {
        // ... (existing context fetching logic) ... 
        // 1. Fetch deep context
        const [transactions, budgets, goals, accounts] = await Promise.all([
            pool.query('SELECT amount, type, category, date, note, account_id, target_account_id FROM transactions WHERE user_id = $1 ORDER BY date DESC', [userId]),
            pool.query('SELECT category, limit_amount, account_id FROM budgets WHERE user_id = $1', [userId]),
            pool.query('SELECT name, target_amount, current_amount FROM savings_goals WHERE user_id = $1', [userId]),
            pool.query('SELECT id, name, type, balance FROM accounts WHERE user_id = $1', [userId])
        ]);

        // Calculate precise totals
        const allTransactions = transactions.rows;
        const totalIncome = allTransactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + Number(t.amount), 0);
        const totalExpenses = allTransactions.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + Number(t.amount), 0);
        const totalBalance = totalIncome - totalExpenses;

        // Group expenses by category for context
        const expensesByCategory: { [key: string]: number } = {};
        allTransactions.filter((t: any) => t.type === 'expense').forEach((t: any) => {
            expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + Number(t.amount);
        });

        // 2. Build conversation history
        const conversationHistory = messages.map((m: any) => `${m.role === 'user' ? 'Utilisateur' : 'Butler'}: ${m.content}`).join('\n\n');
        const lastUserMessage = messages[messages.length - 1].content;

        let toneInstruction = "- Utilise un ton de majordome de luxe (ex: 'Bien sûr, Monsieur/Madame', 'Je vous suggère...').\n- Réponds en FRANÇAIS soutenu.";

        if (language === 'tn') {
            toneInstruction = "- Réponds en TOUNSI (dialecte tunisien) écrit en LETTRES ARABES (Script Arabe).\n- Sois cool, proche, un peu comme un pote sage qui gère l'argent.\n- Utilise des mots comme: 'فلوس', 'مصروف', 'دينار', 'يا معلم'.";
        }

        const fullPrompt = `
Tu es le "Neural Butler", un majordome financier d'élite, sophistiqué, poli et extrêmement perspicace.
Ton but est d'aider l'utilisateur à gérer son capital avec une précision chirurgicale.
Tu as le pouvoir d'AGIR sur le compte de l'utilisateur via des outils.

CONTEXTE FINANCIER COMPLET DE L'UTILISATEUR (Calculé sur tout l'historique) :
- Revenus Totaux : ${totalIncome.toFixed(3)} TND
- Dépenses Totales : ${totalExpenses.toFixed(3)} TND
- Solde Net Actuel : ${totalBalance.toFixed(3)} TND

COMPTES :
${JSON.stringify(accounts.rows)}

DÉTAILS DES BUDGETS :
${JSON.stringify(budgets.rows)}

DÉPENSES PAR CATÉGORIE (Historique global) :
${JSON.stringify(expensesByCategory)}

OBJECTIFS D'ÉPARGNE :
${JSON.stringify(goals.rows)}

DERNIÈRES TRANSACTIONS (Pour le contexte récent) :
${JSON.stringify(allTransactions.slice(0, 20))}

HISTORIQUE DE LA CONVERSATION :
${conversationHistory}

QUESTION ACTUELLE DE L'UTILISATEUR :
${lastUserMessage}

DIRECTIVES DE PERSONNALITÉ :
${toneInstruction}
- Sois concis (max 3-4 phrases par réponse).
- Donne des conseils basés strictement sur les données fournies.
- N'invente pas de transactions.

Réponds en tant que Neural Butler. Si l'utilisateur demande une action (créer/supprimer/ajouter), utilise l'outil approprié.
`;

        const tools = [
            {
                type: "function",
                function: {
                    name: "manage_budget",
                    description: "Create, update, or delete a budget category limit",
                    parameters: {
                        type: "object",
                        properties: {
                            action: { type: "string", enum: ["create", "update", "delete"] },
                            category: { type: "string", description: "Category name (e.g., 'Alimentation')" },
                            amount: { type: "number", description: "Limit amount in TND" }
                        },
                        required: ["action", "category"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "add_transaction",
                    description: "Add a new income or expense transaction",
                    parameters: {
                        type: "object",
                        properties: {
                            amount: { type: "number", description: "Amount in TND" },
                            type: { type: "string", enum: ["income", "expense"] },
                            category: { type: "string", description: "Category name" },
                            note: { type: "string", description: "Description or note" }
                        },
                        required: ["amount", "type", "category"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "manage_savings_goal",
                    description: "Create or delete a savings goal",
                    parameters: {
                        type: "object",
                        properties: {
                            action: { type: "string", enum: ["create", "delete"] },
                            name: { type: "string", description: "Goal name" },
                            target_amount: { type: "number", description: "Target amount in TND" }
                        },
                        required: ["action", "name"]
                    }
                }
            }
        ];

        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [{ role: "user", content: fullPrompt }],
            tools: tools as any,
            tool_choice: "auto",
            temperature: 0.6,
            max_tokens: 1024
        });

        const toolCall = completion.choices[0]?.message?.tool_calls?.[0];

        if (toolCall) {
            const funcName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);
            let actionResult = "";

            if (funcName === "manage_budget") {
                if (args.action === "delete") {
                    await pool.query('DELETE FROM budgets WHERE user_id = $1 AND category = $2', [userId, args.category]);
                    actionResult = `Budget pour ${args.category} supprimé.`;
                } else {
                    await pool.query(
                        'INSERT INTO budgets (user_id, category, limit_amount) VALUES ($1, $2, $3) ON CONFLICT (user_id, category) DO UPDATE SET limit_amount = $3',
                        [userId, args.category, args.amount]
                    );
                    actionResult = `Budget pour ${args.category} défini à ${args.amount} TND.`;
                }
            } else if (funcName === "add_transaction") {
                await pool.query(
                    'INSERT INTO transactions (user_id, amount, type, category, date, note) VALUES ($1, $2, $3, $4, CURRENT_DATE, $5)',
                    [userId, args.amount, args.type, args.category, args.note || '']
                );
                actionResult = `Transaction de ${args.amount} TND (${args.category}) ajoutée.`;
            } else if (funcName === "manage_savings_goal") {
                if (args.action === "delete") {
                    await pool.query('DELETE FROM savings_goals WHERE user_id = $1 AND name = $2', [userId, args.name]);
                    actionResult = `Objectif "${args.name}" supprimé.`;
                } else {
                    await pool.query(
                        'INSERT INTO savings_goals (user_id, name, target_amount) VALUES ($1, $2, $3)',
                        [userId, args.name, args.target_amount]
                    );
                    actionResult = `Objectif "${args.name}" créé avec une cible de ${args.target_amount} TND.`;
                }
            }

            res.json({ content: `✅ Action effectuée : ${actionResult}`, actionTaken: true });
        } else {
            res.json({ content: completion.choices[0]?.message?.content || "Je n'ai pas compris." });
        }

    } catch (err) {
        console.error("Neural Butler Error:", err);
        res.status(500).json({ error: "Le majordome a rencontré un problème technique." });
    }
});

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

// Auto-initialize Schema
const initDB = async () => {
    try {
        // Essential tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS accounts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                balance DECIMAL(12,2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Migration for existing tables
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='account_id') THEN
                    ALTER TABLE transactions ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='target_account_id') THEN
                    ALTER TABLE transactions ADD COLUMN target_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='budgets' AND column_name='account_id') THEN
                    ALTER TABLE budgets ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recurring_templates' AND column_name='account_id') THEN
                    ALTER TABLE recurring_templates ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='savings_goals' AND column_name='account_id') THEN
                    ALTER TABLE savings_goals ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE SET NULL;
                END IF;
            END $$;

            CREATE TABLE IF NOT EXISTS transactions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id TEXT NOT NULL,
                account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
                target_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
                amount DECIMAL(12,2) NOT NULL,
                type TEXT NOT NULL,
                category TEXT NOT NULL,
                date DATE NOT NULL,
                note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS budgets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id TEXT NOT NULL,
                account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
                category TEXT NOT NULL,
                limit_amount DECIMAL(12,2) NOT NULL,
                UNIQUE(user_id, category, account_id)
            );

            CREATE TABLE IF NOT EXISTS recurring_templates (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id TEXT NOT NULL,
                account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
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

            CREATE TABLE IF NOT EXISTS savings_goals (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id TEXT NOT NULL,
                account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
                name TEXT NOT NULL,
                target_amount DECIMAL(12,2) NOT NULL,
                current_amount DECIMAL(12,2) DEFAULT 0,
                category TEXT,
                deadline DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
            CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
            CREATE INDEX IF NOT EXISTS idx_recurring_user_id ON recurring_templates(user_id);
        `);
        console.log("✅ DB Tables & Indices Verified");
    } catch (err) {
        console.error("❌ DB Init Error:", err);
    }
};
initDB();

// Accounts Routes
app.get('/api/accounts', authenticateToken, async (req: any, res) => {
    const userId = getUserId(req);
    try {
        const result = await pool.query('SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching accounts' });
    }
});

app.post('/api/accounts', authenticateToken, async (req: any, res) => {
    const userId = getUserId(req);
    const { name, type, balance } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO accounts (user_id, name, type, balance) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, name, type, balance || 0]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error creating account' });
    }
});

app.delete('/api/accounts/:id', authenticateToken, async (req: any, res) => {
    const userId = getUserId(req);
    try {
        await pool.query('DELETE FROM accounts WHERE id = $1 AND user_id = $2', [req.params.id, userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting account' });
    }
});

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
    console.log(`[GET] /api/transactions - Fetching for user: ${userId}`);
    try {
        await processRecurrences(userId);
        const result = await pool.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC', [userId]);
        console.log(`[GET] /api/transactions - Found ${result.rowCount} transactions`);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching transactions:", err);
        res.status(500).json({ error: 'Error fetching transactions' });
    }
});

app.post('/api/transactions', authenticateToken, async (req: any, res) => {
    const userId = getUserId(req);
    const { amount, type, category, date, note, account_id, target_account_id } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert transaction
        const result = await client.query(
            'INSERT INTO transactions (user_id, amount, type, category, date, note, account_id, target_account_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [userId, amount, type, category, date, note, account_id, target_account_id]
        );

        // Update balances
        if (type === 'income') {
            await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2 AND user_id = $3', [amount, account_id, userId]);
        } else if (type === 'expense') {
            await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2 AND user_id = $3', [amount, account_id, userId]);
        } else if (type === 'transfer' && target_account_id) {
            await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2 AND user_id = $3', [amount, account_id, userId]);
            await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2 AND user_id = $3', [amount, target_account_id, userId]);
        }

        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error adding transaction' });
    } finally {
        client.release();
    }
});

app.delete('/api/transactions/:id', authenticateToken, async (req: any, res) => {
    const userId = getUserId(req);
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Get transaction details first
        const tRes = await client.query('SELECT * FROM transactions WHERE id = $1 AND user_id = $2', [req.params.id, userId]);
        if (tRes.rowCount && tRes.rowCount > 0) {
            const t = tRes.rows[0];
            const amount = Number(t.amount);

            // Revert balances
            if (t.type === 'income') {
                await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2 AND user_id = $3', [amount, t.account_id, userId]);
            } else if (t.type === 'expense') {
                await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2 AND user_id = $3', [amount, t.account_id, userId]);
            } else if (t.type === 'transfer' && t.target_account_id) {
                await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2 AND user_id = $3', [amount, t.account_id, userId]);
                await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2 AND user_id = $3', [amount, t.target_account_id, userId]);
            }
        }

        await client.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [req.params.id, userId]);
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error deleting transaction' });
    } finally {
        client.release();
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

// Savings Goals
app.get('/api/savings', authenticateToken, async (req: any, res) => {
    const userId = getUserId(req);
    try {
        const result = await pool.query('SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching savings goals' });
    }
});

app.post('/api/savings', authenticateToken, async (req: any, res) => {
    const userId = getUserId(req);
    const { id, name, target_amount, current_amount, category, deadline } = req.body;
    try {
        if (id) {
            // Update
            const result = await pool.query(
                `UPDATE savings_goals 
                 SET name = $1, target_amount = $2, current_amount = $3, category = $4, deadline = $5 
                 WHERE id = $6 AND user_id = $7 
                 RETURNING *`,
                [name, target_amount, current_amount, category, deadline, id, userId]
            );
            res.json(result.rows[0]);
        } else {
            // Create
            const result = await pool.query(
                'INSERT INTO savings_goals (user_id, name, target_amount, current_amount, category, deadline) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [userId, name, target_amount, current_amount, category, deadline]
            );
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error saving goal' });
    }
});

app.delete('/api/savings/:id', authenticateToken, async (req: any, res) => {
    const userId = getUserId(req);
    try {
        await pool.query('DELETE FROM savings_goals WHERE id = $1 AND user_id = $2', [req.params.id, userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting goal' });
    }
});

// Reset Account Data
app.delete('/api/user/reset', authenticateToken, async (req: any, res) => {
    const userId = getUserId(req);
    try {
        await pool.query('BEGIN');
        await pool.query('DELETE FROM transactions WHERE user_id = $1', [userId]);
        await pool.query('DELETE FROM budgets WHERE user_id = $1', [userId]);
        await pool.query('DELETE FROM recurring_templates WHERE user_id = $1', [userId]);
        await pool.query('DELETE FROM savings_goals WHERE user_id = $1', [userId]);
        await pool.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error("Error resetting user data:", err);
        res.status(500).json({ error: 'Error resetting your data' });
    }
});
// --- Gemini AI Insights Endpoint ---
app.post('/api/ai/insights', authenticateToken, async (req: any, res) => {
    const { financialData } = req.body;

    if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: "AI key not configured" });
    }

    try {
        const prompt = `
            Tu es un expert financier neural et motivant. Réponds uniquement en FRANÇAIS. Analyse ces données financières de l'utilisateur :
            ${JSON.stringify(financialData)}

            Règles strictes :
            1. Donne exactement 3 conseils ultra-courts (maximum 15 mots par conseil).
            2. Sois percutant, moderne et utilise un ton "Executive" (ou sage en dialecte).
            3. Réponds uniquement en JSON avec ce format : {"insights": ["conseil 1", "conseil 2", "conseil 3"]}
        `;

        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.6,
            max_tokens: 512
        });

        const responseText = completion.choices[0]?.message?.content || "{}";
        const insights = JSON.parse(responseText.replace(/```json|```/g, "").trim());

        res.json(insights);
    } catch (err) {
        console.error("AI Insights Error:", err);
        res.status(500).json({ error: "Error generating AI insights" });
    }
});
// --- Gemini AI Simulation Endpoint ---
app.post('/api/ai/simulate', authenticateToken, async (req, res) => {
    const { simulationData, financialContext } = req.body;

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API Key missing" });
    }

    try {
        const prompt = `
            Tu es un oracle financier neural. Analyse ce projet de simulation :
            Projet: ${simulationData.name}
            Coût: ${simulationData.target}
            Effort supplémentaire: ${simulationData.effort} /mois
            
            Contexte financier actuel de l'utilisateur :
            ${JSON.stringify(financialContext)}

            Règles strictes :
            1. Donne un score de faisabilité de 0 à 100 (basé sur le temps et l'effort).
            2. Donne un conseil tactique unique de maximum 20 mots.
            3. Réponds uniquement en JSON : {"score": number, "advice": "ton conseil"}
        `;

        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.6,
            max_tokens: 256
        });

        const text = completion.choices[0]?.message?.content || "{\"score\": 50, \"advice\": \"Données insuffisantes.\"}";
        const cleanedJson = text.replace(/```json|```/g, "").trim();
        res.json(JSON.parse(cleanedJson));
    } catch (err) {
        console.error("AI Simulation Error:", err);
        res.status(500).json({ error: "Error generating simulation analysis" });
    }
});

export default app;
