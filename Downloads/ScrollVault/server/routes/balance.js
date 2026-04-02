import { Router } from 'express';
import auth from '../middleware/auth.js';
import supabase from '../db.js';

const router = Router();

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

export default router;