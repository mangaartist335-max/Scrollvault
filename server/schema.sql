-- ScrollVault Database Schema
-- Run this in the Supabase SQL Editor after creating your project.

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);

-- Balances table
CREATE TABLE balances (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Linked social accounts
CREATE TABLE linked_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter', 'facebook')),
  platform_user_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  profile_name TEXT,
  connected_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform)
);

CREATE INDEX idx_linked_accounts_user ON linked_accounts(user_id);

-- Scroll events log
CREATE TABLE scroll_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  scroll_amount INTEGER,
  earned NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_scroll_events_user ON scroll_events(user_id);
CREATE INDEX idx_scroll_events_created ON scroll_events(created_at);

-- Trigger: auto-update balances.updated_at
CREATE OR REPLACE FUNCTION update_balance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER balance_updated
  BEFORE UPDATE ON balances
  FOR EACH ROW
  EXECUTE FUNCTION update_balance_timestamp();