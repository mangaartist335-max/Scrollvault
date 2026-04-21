import { useEffect, useRef } from 'react';

export default function AdSenseBanner() {
  const client = import.meta.env.VITE_ADSENSE_CLIENT;
  const slot = import.meta.env.VITE_ADSENSE_SLOT;
  const hasLoaded = useRef(false);

  useEffect(() => {
    // Only push if we have client and slot, and haven't pushed yet
    if (client && slot && client !== 'ca-pub-0000000000000000' && !hasLoaded.current) {
      try {
        hasLoaded.current = true;
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense push failed', err);
      }
    }
  }, [client, slot]);

  // Fallback placeholder during local dev or before keys are added
  if (!client || !slot || client === 'ca-pub-0000000000000000') {
    return (
      <div className="w-full mt-1 h-20 bg-[#0f172a] border border-dashed border-vault-border/50 rounded-xl flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-2 right-3 text-[10px] text-vault-text-secondary uppercase tracking-widest font-bold">Ad</div>
        <p className="text-vault-text-secondary font-medium text-sm">AdSense Placement (Pending Setup)</p>
      </div>
    );
  }

  return (
    <div className="w-full mt-1 overflow-hidden flex justify-center bg-[#0f172a] rounded-xl border border-vault-border/30 min-h-[90px]">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
