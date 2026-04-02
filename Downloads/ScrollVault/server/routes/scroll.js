import { Router } from 'express';
import auth from '../middleware/auth.js';
import supabase from '../db.js';

const router = Router();

const MAX_BALANCE = 20;
const EARN_AMOUNT = 3;
const VALID_PLATFORMS = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook'];

// POST /api/scroll-event
router.post('/', auth, async (req, res) => {
  try {
    const { platform, scrollAmount } = req.body;

    if (!platform || !VALID_PLATFORMS.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    // Verify platform is connected for this user
    const { data: linked } = await supabase
      .from('linked_accounts')
      .select('id')
      .eq('user_id', req.userId)
      .eq('platform', platform)
      .single();

    if (!linked) {
      return res.status(403).json({ error: `${platform} is not connected` });
    }

    // Get current balance
    const { data: bal } = await supabase
      .from('balances')
      .select('amount')
      .eq('user_id', req.userId)
      .single();

    const currentAmount = bal?.amount ?? 0;
    if (currentAmount >= MAX_BALANCE) {
      return res.json({ earned: 0, balance: MAX_BALANCE, message: 'Vault is full' });
    }

    const earned = Math.min(EARN_AMOUNT, MAX_BALANCE - currentAmount);
    const newAmount = currentAmount + earned;

    // Update balance
    await supabase
      .from('balances')
      .update({ amount: newAmount })
      .eq('user_id', req.userId);

    // Log the event
    await supabase.from('scroll_events').insert({
      user_id: req.userId,
      platform,
      scroll_amount: scrollAmount || 0,
      earned,
    });

    res.json({ earned, balance: newAmount });
  } catch (err) {
    console.error('Scroll event error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;