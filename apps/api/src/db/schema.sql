-- ========================================================
-- Trip Splitter & SDD Progress Tracker D1 Database Schema
-- ========================================================

-- 0. SDD Progress Tracker Tasks (docs/sdd-tracker/SPEC.md 準拠)
CREATE TABLE IF NOT EXISTS sdd_tasks (
    id TEXT PRIMARY KEY,
    project_name TEXT NOT NULL,
    feature_name TEXT NOT NULL,
    assignee TEXT NOT NULL,
    spec_doc_path TEXT,
    design_status TEXT NOT NULL CHECK(design_status IN ('todo', 'in_progress', 'review_submitted', 'approved')) DEFAULT 'todo',
    impl_status TEXT NOT NULL CHECK(impl_status IN ('todo', 'in_progress', 'review_submitted', 'completed', 'blocked')) DEFAULT 'todo',
    estimated_hours DECIMAL(5, 1) NOT NULL DEFAULT 0,
    actual_hours DECIMAL(5, 1) NOT NULL DEFAULT 0,
    blocker_tag TEXT,
    ai_review_summary TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sdd_tasks_assignee ON sdd_tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_sdd_tasks_status ON sdd_tasks(design_status, impl_status);

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Trips
CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    destination TEXT,
    cover_image_url TEXT,
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
    receipt_image_url TEXT,
    ai_analysis_status TEXT CHECK(ai_analysis_status IN ('pending', 'completed', 'failed')) DEFAULT NULL,
    ai_summary TEXT,
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
    payer_user_id INTEGER NOT NULL,
    payee_user_id INTEGER NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    settled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (payer_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (payee_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_trip_participants_user ON trip_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_user ON expense_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_trip ON settlements(trip_id);
