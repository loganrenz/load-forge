-- loadtest.dev D1 Schema Migration
-- Creates all tables for the loadtest.dev load testing SaaS

-- Users & Authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  name TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT UNIQUE,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Subscriptions & Billing
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  tier TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start INTEGER,
  current_period_end INTEGER,
  cancel_at_period_end INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Load Test Scripts
CREATE TABLE IF NOT EXISTS test_scripts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  script TEXT NOT NULL,
  config TEXT DEFAULT '{}',
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Test Runs
CREATE TABLE IF NOT EXISTS test_runs (
  id TEXT PRIMARY KEY,
  script_id TEXT NOT NULL REFERENCES test_scripts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  config TEXT NOT NULL,
  metrics TEXT,
  started_at INTEGER,
  completed_at INTEGER,
  error_message TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Real-time Test Metrics
CREATE TABLE IF NOT EXISTS test_metrics (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
  timestamp INTEGER NOT NULL,
  data TEXT NOT NULL
);

-- Usage Tracking
CREATE TABLE IF NOT EXISTS usage_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_start TEXT NOT NULL,
  vu_minutes INTEGER NOT NULL DEFAULT 0,
  test_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  last_used_at INTEGER,
  expires_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Indices for common queries
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_test_scripts_user_id ON test_scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_user_id ON test_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_script_id ON test_runs(script_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_status ON test_runs(status);
CREATE INDEX IF NOT EXISTS idx_test_metrics_run_id ON test_metrics(run_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
