
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_zXATiY0Bt9vH@ep-super-bar-ahzmhpl6-pooler.c-3.us-east-1.aws.neon.tech/budgetdb?sslmode=require&channel_binding=require',
    ssl: {
        rejectUnauthorized: false
    }
});

const migrate = async () => {
    try {
        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS transactions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                amount NUMERIC(10, 2) NOT NULL,
                type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
                category VARCHAR(50) NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS budgets (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                category VARCHAR(50) NOT NULL,
                limit_amount NUMERIC(10, 2) NOT NULL,
                UNIQUE(user_id, category)
            );
        `);
        console.log('Migration successful: Tables created!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
};

migrate();
