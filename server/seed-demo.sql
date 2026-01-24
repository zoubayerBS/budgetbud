-- BudgetBud Demo Data Generation Script
-- Generates a user with 6 months of realistic financial data

-- 1. Create Demo User
INSERT INTO users (id, email, password_hash)
VALUES ('00000000-0000-0000-0000-000000000000', 'demo@budgetbud.com', '$2b$10$YKoIQrZ3TFBepyg1ujaYuuq/eaTyJvbWGZbbRNZl9Su1UwO9YK78q')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- 2. Define Budgets for Demo User
INSERT INTO budgets (user_id, category, limit_amount)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'Alimentation', 500.00),
    ('00000000-0000-0000-0000-000000000000', 'Transport', 150.00),
    ('00000000-0000-0000-0000-000000000000', 'Loisirs', 200.00),
    ('00000000-0000-0000-0000-000000000000', 'Logement', 1000.00),
    ('00000000-0000-0000-0000-000000000000', 'Abonnements', 100.00)
ON CONFLICT (user_id, category) DO UPDATE SET limit_amount = EXCLUDED.limit_amount;

-- 3. Generate Transactions for the last 6 months
DO $$
DECLARE
    demo_user_id UUID := '00000000-0000-0000-0000-000000000000';
    current_month DATE := date_trunc('month', CURRENT_DATE) - INTERVAL '6 months';
    target_date DATE;
BEGIN
    FOR i IN 0..6 LOOP
        target_date := current_month + (i || ' months')::INTERVAL;
        
        -- Monthly Salary
        INSERT INTO transactions (user_id, amount, type, category, date, note)
        VALUES (demo_user_id, 3200.00, 'income', 'Salaire', target_date + INTERVAL '1 day', 'Salaire mensuel');

        -- Monthly Rent
        INSERT INTO transactions (user_id, amount, type, category, date, note)
        VALUES (demo_user_id, 950.00, 'expense', 'Logement', target_date + INTERVAL '2 days', 'Loyer appartement');

        -- Monthly Utilities
        INSERT INTO transactions (user_id, amount, type, category, date, note)
        VALUES (demo_user_id, 85.00, 'expense', 'Logement', target_date + INTERVAL '5 days', 'Électricité & Eau');

        -- Monthly Internet/Phone
        INSERT INTO transactions (user_id, amount, type, category, date, note)
        VALUES (demo_user_id, 45.00, 'expense', 'Abonnements', target_date + INTERVAL '10 days', 'Forfait Fibre + Mobile');

        -- Weekly Groceries
        FOR j IN 0..4 LOOP
            INSERT INTO transactions (user_id, amount, type, category, date, note)
            VALUES (demo_user_id, 80.00 + (random() * 40), 'expense', 'Alimentation', target_date + (j * 7 || ' days')::INTERVAL + INTERVAL '3 days', 'Courses hebdomadaires');
        END LOOP;

        -- Transport
        INSERT INTO transactions (user_id, amount, type, category, date, note)
        VALUES (demo_user_id, 75.00, 'expense', 'Transport', target_date + INTERVAL '1 day', 'Pass Transport');

        -- Leisure
        INSERT INTO transactions (user_id, amount, type, category, date, note)
        VALUES (demo_user_id, 30.00 + (random() * 50), 'expense', 'Loisirs', target_date + INTERVAL '15 days', 'Restaurant');
        INSERT INTO transactions (user_id, amount, type, category, date, note)
        VALUES (demo_user_id, 20.00 + (random() * 30), 'expense', 'Loisirs', target_date + INTERVAL '22 days', 'Cinéma / Sortie');

        -- Freelance
        IF random() > 0.7 THEN
            INSERT INTO transactions (user_id, amount, type, category, date, note)
            VALUES (demo_user_id, 200.00 + (random() * 300), 'income', 'Freelance', target_date + INTERVAL '18 days', 'Mission ponctuelle');
        END IF;

    END LOOP;
END $$;
