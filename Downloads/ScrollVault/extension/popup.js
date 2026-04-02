const API_BASE = 'http://localhost:3001';

const authSection = document.getElementById('auth-section');
const dashSection = document.getElementById('dashboard-section');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const balanceAmount = document.getElementById('balance-amount');
const authError = document.getElementById('auth-error');

// Check if already logged in
chrome.storage.local.get(['sv_token'], (result) => {
  if (result.sv_token) {
    showDashboard(result.sv_token);
  } else {
    showAuth();
  }
});

function showAuth() {
  authSection.classList.add('visible');
  dashSection.classList.remove('visible');
}

function showDashboard(token) {
  authSection.classList.remove('visible');
  dashSection.classList.add('visible');
  fetchBalance(token);
}

loginBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  authError.textContent = '';

  if (!email || !password) {
    authError.textContent = 'Enter email and password';
    return;
  }

  loginBtn.textContent = 'Logging in...';
  loginBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Login failed');

    chrome.storage.local.set({ sv_token: data.token }, () => {
      showDashboard(data.token);
    });
  } catch (err) {
    authError.textContent = err.message;
  } finally {
    loginBtn.textContent = 'Log In';
    loginBtn.disabled = false;
  }
});

logoutBtn.addEventListener('click', () => {
  chrome.storage.local.remove(['sv_token'], () => {
    showAuth();
  });
});

async function fetchBalance(token) {
  try {
    const res = await fetch(`${API_BASE}/api/balance`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      balanceAmount.textContent = `$${data.balance}`;
      if (data.balance >= 20) {
        balanceAmount.style.color = '#fbbf24';
      } else {
        balanceAmount.style.color = '#10b981';
      }
    }
  } catch {
    // Silently fail
  }
}