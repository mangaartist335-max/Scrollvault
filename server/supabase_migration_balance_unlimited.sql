-- Run once in Supabase SQL Editor: remove global $20 balance cap.
-- TikTok-only $20 cap is enforced in application code (scroll_events sum).

ALTER TABLE balances DROP CONSTRAINT IF EXISTS balances_amount_check;
ALTER TABLE balances DROP CONSTRAINT IF EXISTS balances_check;

-- Only non-negative balance (no upper limit)
ALTER TABLE balances ADD CONSTRAINT balances_amount_nonneg CHECK (amount >= 0);
