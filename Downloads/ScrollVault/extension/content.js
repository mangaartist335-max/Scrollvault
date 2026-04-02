// ScrollVault Content Script
// Injected into Instagram, TikTok, YouTube, Facebook, Twitter/X.
// Detects doom scrolling and reports to background service worker.

const SCROLL_THRESHOLD = 5000; // px accumulated before reporting
const COOLDOWN_MS = 10000;     // 10s between reports

let scrollAccumulator = 0;
let lastReportTime = 0;

// Detect which platform we're on
function detectPlatform() {
  const host = window.location.hostname;
  if (host.includes('instagram.com')) return 'instagram';
  if (host.includes('tiktok.com')) return 'tiktok';
  if (host.includes('youtube.com')) {
    return window.location.pathname.includes('/shorts') ? 'youtube' : null;
  }
  if (host.includes('facebook.com')) return 'facebook';
  if (host.includes('twitter.com') || host.includes('x.com')) return 'twitter';
  return null;
}

const platform = detectPlatform();

// Only activate on supported platforms (and YouTube only on Shorts)
if (platform) {
  function trackScroll(amount) {
    scrollAccumulator += Math.abs(amount);

    if (scrollAccumulator >= SCROLL_THRESHOLD) {
      const now = Date.now();
      if (now - lastReportTime > COOLDOWN_MS) {
        reportScroll(scrollAccumulator);
        lastReportTime = now;
        scrollAccumulator = 0;
      }
    }
  }

  // Mouse wheel
  window.addEventListener('wheel', (e) => {
    trackScroll(e.deltaY);
  }, { passive: true });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
      trackScroll(800);
    }
  });

  // Touch swipe
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const distance = Math.abs(touchStartY - e.changedTouches[0].clientY);
    if (distance > 50) trackScroll(distance * 3);
  }, { passive: true });

  // For YouTube Shorts, re-check URL on navigation (SPA)
  if (window.location.hostname.includes('youtube.com')) {
    let lastUrl = window.location.href;
    new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        // Reset if navigated away from Shorts
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
}

function reportScroll(amount) {
  chrome.runtime.sendMessage(
    { type: 'REPORT_SCROLL', platform, scrollAmount: amount },
    (response) => {
      if (response?.success && response.data?.earned > 0) {
        showToast(response.data.earned, response.data.balance);
      }
    }
  );
}

function showToast(earned, total) {
  const existing = document.getElementById('sv-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'sv-toast';
  toast.textContent = `💰 +$${earned} ScrollVault! (Total: $${total}/$20)`;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 14px 24px;
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-weight: 700;
    font-size: 15px;
    z-index: 2147483647;
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    pointer-events: none;
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}