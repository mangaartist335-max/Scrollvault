import { Router } from 'express';
import auth from '../middleware/auth.js';
import supabase from '../db.js';
import paypal from '@paypal/payouts-sdk';

const router = Router();

const MIN_WITHDRAW = Number(process.env.MIN_WITHDRAW ?? 10);

const MAX_BALANCE_UPDATE_ATTEMPTS = 5;

function normalizeMoney(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return Number(parsed.toFixed(2));
}

function parsePayPalError(error) {
  if (!error?.message) return { message: 'Unknown PayPal Error' };

  try {
    return JSON.parse(error.message);
  } catch {
    return { message: error.message };
  }
}

async function reserveWithdrawal(userId, amount) {
  for (let attempt = 0; attempt < MAX_BALANCE_UPDATE_ATTEMPTS; attempt += 1) {
    const { data: balanceData, error: balanceError } = await supabase
      .from('balances')
      .select('amount')
      .eq('user_id', userId)
      .single();

    if (balanceError) throw balanceError;

    const currentAmount = Number(balanceData.amount);
    if (currentAmount < amount) return undefined;

    const newAmount = Number((currentAmount - amount).toFixed(2));
    const { data: updatedRows, error: updateError } = await supabase
      .from('balances')
      .update({ amount: newAmount })
      .eq('user_id', userId)
      .eq('amount', currentAmount)
      .select('amount');

    if (updateError) throw updateError;
    if (updatedRows?.length) return Number(updatedRows[0].amount);
  }

  throw new Error('Could not reserve withdrawal balance after concurrent updates');
}

async function refundWithdrawal(userId, amount) {
  for (let attempt = 0; attempt < MAX_BALANCE_UPDATE_ATTEMPTS; attempt += 1) {
    const { data: balanceData, error: balanceError } = await supabase
      .from('balances')
      .select('amount')
      .eq('user_id', userId)
      .single();

    if (balanceError) throw balanceError;

    const currentAmount = Number(balanceData.amount);
    const refundedAmount = Number((currentAmount + amount).toFixed(2));
    const { data: updatedRows, error: updateError } = await supabase
      .from('balances')
      .update({ amount: refundedAmount })
      .eq('user_id', userId)
      .eq('amount', currentAmount)
      .select('amount');

    if (updateError) throw updateError;
    if (updatedRows?.length) return;
  }

  throw new Error('Could not refund withdrawal balance after concurrent updates');
}

// Setup PayPal Environment (Sandbox for now)
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

// GET /api/balance
router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('balances')
      .select('amount, updated_at')
      .eq('user_id', req.userId)
      .single();

    if (error) throw error;
    res.json({ balance: data?.amount ?? 0, updatedAt: data?.updated_at });
  } catch (err) {
    console.error('Balance fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/balance/reset
router.post('/reset', auth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('balances')
      .update({ amount: 0 })
      .eq('user_id', req.userId);

    if (error) throw error;
    res.json({ balance: 0 });
  } catch (err) {
    console.error('Balance reset error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/balance/withdraw
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, method, details } = req.body;
    const withdrawAmount = normalizeMoney(amount);
    if (withdrawAmount === undefined || withdrawAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (withdrawAmount < MIN_WITHDRAW) {
      return res
        .status(400)
        .json({ error: `Minimum withdrawal is $${MIN_WITHDRAW.toFixed(2)}` });
    }

    const newBalance = await reserveWithdrawal(req.userId, withdrawAmount);
    if (newBalance === undefined) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    if (method === 'PayPal') {
      // Call PayPal Payouts API
      const request = new paypal.payouts.PayoutsPostRequest();
      request.requestBody({
        sender_batch_header: {
          recipient_type: "EMAIL",
          email_message: "ScrollVault Withdrawal - Your funds have arrived!",
          note: "Enjoy your ScrollVault rewards!",
          sender_batch_id: `sv_withdraw_${Date.now()}_${req.userId}`,
          email_subject: "You received a payment from ScrollVault!"
        },
        items: [{
          amount: {
            currency: "USD",
            value: withdrawAmount.toFixed(2)
          },
          receiver: details, // This is the user's PayPal email they typed in
          note: `ScrollVault Cashout for $${withdrawAmount.toFixed(2)}`
        }]
      });

      try {
        const response = await client.execute(request);
        console.log(`PayPal Payout successful. Batch ID: ${response.result.batch_header.payout_batch_id}`);
      } catch (paypalError) {
        console.error('PayPal Payout failed:', paypalError);
        await refundWithdrawal(req.userId, withdrawAmount);
        const errorDetails = parsePayPalError(paypalError);

        // Let's handle the specific "Authorization failed" error gracefully in the UI
        if (errorDetails.name === 'AUTHORIZATION_ERROR') {
          return res.status(400).json({ error: 'PayPal account needs Payouts permission. Check developer.paypal.com' });
        }

        return res.status(400).json({ error: 'PayPal transfer failed. Please check your email/account details.' });
      }
    }

    res.json({ success: true, newBalance });
  } catch (err) {
    console.error('Withdraw error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;