// ScrollVault Extension - Background Service Worker
// Manages auth state and relays scroll events to the backend API.

const API_BASE = 'http://localhost:3001';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'REPORT_SCROLL') {
    handleScrollReport(request.platform, request.scrollAmount)
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // keep message channel open for async response
  }

  if (request.type === 'GET_AUTH') {
    chrome.storage.local.get(['sv_token'], (result) => {
      sendResponse({ token: result.sv_token || null });
    });
    return true;
  }
});

async function handleScrollReport(platform, scrollAmount) {
  const { sv_token } = await chrome.storage.local.get(['sv_token']);
  if (!sv_token) throw new Error('Not logged in');

  const res = await fetch(`${API_BASE}/api/scroll-event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sv_token}`,
    },
    body: JSON.stringify({ platform, scrollAmount }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'API error');
  }

  return res.json();
}