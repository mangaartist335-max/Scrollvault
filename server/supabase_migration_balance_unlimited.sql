-- Run once in Supabase SQL Editor: allow fractional-dollar balances/earnings
-- and remove the old global $20 balance cap.

ALTER TABLE balances DROP CONSTRAINT IF EXISTS balances_amount_check;
ALTER TABLE balances DROP CONSTRAINT IF EXISTS balances_check;
ALTER TABLE balances DROP CONSTRAINT IF EXISTS balances_amount_nonneg;

ALTER TABLE balances
  ALTER COLUMN amount TYPE NUMERIC(12,2)
  USING amount::numeric;

ALTER TABLE scroll_events
  ALTER COLUMN earned TYPE NUMERIC(12,2)
  USING earned::numeric;

-- Only non-negative balance (no upper limit).
ALTER TABLE balances ADD CONSTRAINT balances_amount_nonneg CHECK (amount >= 0);
