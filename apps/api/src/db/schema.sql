-- ========================================================
-- Trip Splitter D1 Database Schema (docs/02_Architecture/database.md 準拠)
-- ========================================================

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT, -- Cloudflare R2 URL
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Trips
CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    destination TEXT,
    cover_image_url TEXT, -- Cloudflare R2 URL
    start_date DATE,
    end_date DATE,
    currency TEXT DEFAULT 'JPY',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Trip Participants (Junction Table)
CREATE TABLE IF NOT EXISTS trip_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'member', 'guest')) DEFAULT 'member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(trip_id, user_id)
);

-- 4. Expenses (Payer Record)
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER NOT NULL,
    payer_user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    category TEXT,
    receipt_image_url TEXT, -- Cloudflare R2 URL
    ai_analysis_status TEXT CHECK(ai_analysis_status IN ('pending', 'completed', 'failed')) DEFAULT NULL,
    ai_summary TEXT, -- Gemini 1.5 Flash レシート解析データ
    paid_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (payer_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 5. Expense Splits (Individual Burden)
CREATE TABLE IF NOT EXISTS expense_splits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(expense_id, user_id)
);

-- 6. Settlements (Inter-user Payment Resolution)
CREATE TABLE IF NOT EXISTS settlements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER NOT NULL,
    payer_user_id INTEGER NOT NULL, -- 送金者
    payee_user_id INTEGER NOT NULL, -- 受領者
    amount DECIMAL(12, 2) NOT NULL,
    settled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (payer_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (payee_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- ========================================================
-- Indexes
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_trip_participants_user ON trip_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_user ON expense_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_trip ON settlements(trip_id);
