-- Run once in Supabase SQL Editor: store fractional earnings and remove the
-- legacy global $20 balance cap. The daily cap is enforced in application code.

ALTER TABLE balances DROP CONSTRAINT IF EXISTS balances_amount_check;
ALTER TABLE balances DROP CONSTRAINT IF EXISTS balances_check;
ALTER TABLE balances DROP CONSTRAINT IF EXISTS balances_amount_nonneg;

ALTER TABLE balances
  ALTER COLUMN amount TYPE NUMERIC(10,2) USING amount::numeric(10,2),
  ALTER COLUMN amount SET DEFAULT 0;

ALTER TABLE scroll_events
  ALTER COLUMN earned TYPE NUMERIC(10,2) USING earned::numeric(10,2),
  ALTER COLUMN earned SET DEFAULT 0;

-- Only non-negative balance (no upper limit).
ALTER TABLE balances ADD CONSTRAINT balances_amount_nonneg CHECK (amount >= 0);
