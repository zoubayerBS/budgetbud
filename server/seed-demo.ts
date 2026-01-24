import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_zXATiY0Bt9vH@ep-super-bar-ahzmhpl6-pooler.c-3.us-east-1.aws.neon.tech/budgetdb?sslmode=require&channel_binding=require',
    ssl: { rejectUnauthorized: false }
});

const seed = async () => {
    try {
        const sql = fs.readFileSync(path.join(process.cwd(), 'server', 'seed-demo.sql'), 'utf8');
        console.log('Seeding demo data...');
        await pool.query(sql);
        console.log('Demo data seeded successfully! 🎉');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await pool.end();
    }
};

seed();
