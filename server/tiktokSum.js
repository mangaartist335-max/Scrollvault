/**
 * Total $ credited from TikTok scroll events only (for the $20 TikTok cap).
 */
export async function getTiktokEarnedTotal(supabase, userId) {
  let total = 0;
  let from = 0;
  const size = 1000;
  for (;;) {
    const { data, error } = await supabase
      .from('scroll_events')
      .select('earned')
      .eq('user_id', userId)
      .eq('platform', 'tiktok')
      .range(from, from + size - 1);

    if (error) throw error;
    if (!data?.length) break;
    for (const row of data) total += Number(row.earned || 0);
    if (data.length < size) break;
    from += size;
  }
  return total;
}
