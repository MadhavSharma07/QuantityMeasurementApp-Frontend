const BASE = 'http://localhost:3000/api';
let JWT_TOKEN = '';
let CURRENT_USER = '';

const UNITS = {
  LengthUnit:      ['FEET', 'INCHES', 'YARDS', 'CENTIMETERS'],
  WeightUnit:      ['MILLIGRAM', 'GRAM', 'KILOGRAM', 'POUND', 'TONNE'],
  VolumeUnit:      ['LITRE', 'MILLILITRE', 'GALLON'],
  TemperatureUnit: ['CELSIUS', 'FAHRENHEIT', 'KELVIN']
};

const TYPES = Object.keys(UNITS);

const OP_MAP = {
  add:      { v1:'add-v1', t1:'add-t1', u1:'add-u1', v2:'add-v2', t2:'add-t2', u2:'add-u2', btn:'add-btn', res:'add-result' },
  subtract: { v1:'sub-v1', t1:'sub-t1', u1:'sub-u1', v2:'sub-v2', t2:'sub-t2', u2:'sub-u2', btn:'sub-btn', res:'sub-result' },
  compare:  { v1:'cmp-v1', t1:'cmp-t1', u1:'cmp-u1', v2:'cmp-v2', t2:'cmp-t2', u2:'cmp-u2', btn:'cmp-btn', res:'cmp-result' },
  convert:  { v1:'cvt-v1', t1:'cvt-t1', u1:'cvt-u1', v2:'cvt-v2', t2:'cvt-t2', u2:'cvt-u2', btn:'cvt-btn', res:'cvt-result' },
  divide:   { v1:'div-v1', t1:'div-t1', u1:'div-u1', v2:'div-v2', t2:'div-t2', u2:'div-u2', btn:'div-btn', res:'div-result' }
};

// ════════════════ INIT ════════════════
window.onload = () => {
  // Populate all type dropdowns
  document.querySelectorAll('select[id$="-t1"], select[id$="-t2"]').forEach(sel => {
    TYPES.forEach(t => {
      const o = document.createElement('option');
      o.value = t;
      o.textContent = t.replace('Unit', '');
      sel.appendChild(o);
    });
  });

  // Auto-login from session
  const stored = sessionStorage.getItem('jwt');
  if (stored) {
    JWT_TOKEN = stored;
    CURRENT_USER = sessionStorage.getItem('user') || 'user';
    showApp();
  }
};

// ════════════════ AUTH TABS ════════════════
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach((b, i) =>
    b.classList.toggle('active', (tab === 'login' && i === 0) || (tab === 'register' && i === 1))
  );
  document.getElementById('login-form').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

// ════════════════ REGISTER ════════════════
async function doRegister() {
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  const msgEl    = document.getElementById('reg-msg');
  const btn      = document.getElementById('reg-btn');

  if (!username || !password) { showMsg(msgEl, 'error', 'Fill in all fields'); return; }

  btn.innerHTML = '<span class="spinner"></span>Creating...';
  btn.classList.add('loading');

  try {
    const res  = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (res.ok) {
      showMsg(msgEl, 'success', 'Account created! Login to continue.');
      setTimeout(() => switchTab('login'), 1200);
    } else {
      showMsg(msgEl, 'error', data.message || 'Registration failed');
    }
  } catch (e) {
    showMsg(msgEl, 'error', 'Cannot connect to server. Is the app running?');
  } finally {
    btn.innerHTML = 'Create Account';
    btn.classList.remove('loading');
  }
}

// ════════════════ LOGIN ════════════════
async function doLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const msgEl    = document.getElementById('login-msg');
  const btn      = document.getElementById('login-btn');

  if (!username || !password) { showMsg(msgEl, 'error', 'Fill in all fields'); return; }

  btn.innerHTML = '<span class="spinner"></span>Logging in...';
  btn.classList.add('loading');

  try {
    const res  = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (res.ok && data.token) {
      JWT_TOKEN    = data.token;
      CURRENT_USER = data.username || username;
      sessionStorage.setItem('jwt',  JWT_TOKEN);
      sessionStorage.setItem('user', CURRENT_USER);
      showApp();
    } else {
      showMsg(msgEl, 'error', data.message || 'Invalid credentials');
    }
  } catch (e) {
    showMsg(msgEl, 'error', 'Cannot connect to server. Is the app running?');
  } finally {
    btn.innerHTML = 'Login';
    btn.classList.remove('loading');
  }
}

// ════════════════ LOGOUT ════════════════
function doLogout() {
  JWT_TOKEN = '';
  CURRENT_USER = '';
  sessionStorage.clear();
  document.getElementById('app-page').style.display  = 'none';
  document.getElementById('auth-page').style.display = 'flex';
}

// ════════════════ SHOW APP ════════════════
function showApp() {
  document.getElementById('auth-page').style.display   = 'none';
  document.getElementById('app-page').style.display    = 'block';
  document.getElementById('user-display').textContent  = CURRENT_USER;
  document.getElementById('user-avatar').textContent   = CURRENT_USER[0].toUpperCase();
}

// ════════════════ NAVIGATION ════════════════
function showPage(name, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  el.classList.add('active');
}

// ════════════════ UNIT DROPDOWN ════════════════
function updateUnits(typeId, unitId) {
  const type    = document.getElementById(typeId).value;
  const unitSel = document.getElementById(unitId);
  unitSel.innerHTML = '<option value="">Select unit</option>';
  if (UNITS[type]) {
    UNITS[type].forEach(u => {
      const o = document.createElement('option');
      o.value = u;
      o.textContent = u;
      unitSel.appendChild(o);
    });
  }
}

// ════════════════ OPERATIONS ════════════════
async function doOperation(op) {
  const ids = OP_MAP[op];
  const v1  = parseFloat(document.getElementById(ids.v1).value);
  const t1  = document.getElementById(ids.t1).value;
  const u1  = document.getElementById(ids.u1).value;
  const v2  = parseFloat(document.getElementById(ids.v2).value);
  const t2  = document.getElementById(ids.t2).value;
  const u2  = document.getElementById(ids.u2).value;
  const resEl = document.getElementById(ids.res);
  const btn   = document.getElementById(ids.btn);

  if (!t1 || !u1 || !t2 || !u2 || isNaN(v1) || isNaN(v2)) {
    showResult(resEl, null, 'Please fill in all fields');
    return;
  }

  const origText = btn.textContent;
  btn.innerHTML = '<span class="spinner"></span>Calculating...';
  btn.classList.add('loading');

  const body = {
    thisQuantityDTO: { value: v1, unit: u1, measurementType: t1, validUnit: true },
    thatQuantityDTO: { value: v2, unit: u2, measurementType: t2, validUnit: true }
  };

  try {
    const res  = await fetch(`${BASE}/app/${op}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JWT_TOKEN}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();

    if (!res.ok) {
      showResult(resEl, null, data.message || `Error ${res.status}`);
      return;
    }

    if (data.error) {
      showResult(resEl, null, data.errorMessage || 'Operation failed');
      return;
    }

    if (op === 'compare') {
      const isEqual = data.resultString === 'true';
      showResult(resEl, isEqual ? '✅ Equal' : '❌ Not Equal', null, '');
    } else if (op === 'divide') {
      showResult(resEl, data.resultValue?.toFixed(4), null, 'ratio (dimensionless)');
    } else {
      showResult(resEl, data.resultValue?.toFixed(4), null, data.resultUnit || '');
    }

    // Fill the convert "To" field
    if (op === 'convert') {
      document.getElementById('cvt-v2').value = data.resultValue?.toFixed(4) || '';
    }

  } catch (e) {
    showResult(resEl, null, 'Server error. Is the backend running?');
  } finally {
    btn.innerHTML = origText;
    btn.classList.remove('loading');
  }
}

// ════════════════ HISTORY ════════════════
async function loadHistoryByOp() {
  const op  = document.getElementById('hist-op-filter').value;
  const data = await authGet(`/app/history/operation/${op}`);
  renderHistoryTable('hist-op-result', data);
}

async function loadHistoryByType() {
  const type = document.getElementById('hist-type-filter').value;
  const data = await authGet(`/app/history/type/${type}`);
  renderHistoryTable('hist-type-result', data);
}

async function loadErrored() {
  const data = await authGet('/app/history/errored');
  renderHistoryTable('errored-result', data);
}

async function loadCounts() {
  const ops    = ['add', 'subtract', 'compare', 'convert', 'divide'];
  const colors = ['#00e5ff', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'];
  const grid   = document.getElementById('count-grid');
  grid.innerHTML = '';

  for (let i = 0; i < ops.length; i++) {
    try {
      const res   = await fetch(`${BASE}/app/count/${ops[i]}`, {
        headers: { 'Authorization': `Bearer ${JWT_TOKEN}` }
      });
      const count = await res.json();
      grid.innerHTML += `
        <div class="count-card">
          <div class="count-number" style="color:${colors[i]}">${count}</div>
          <div class="count-op">${ops[i]}</div>
        </div>`;
    } catch (e) {
      grid.innerHTML += `
        <div class="count-card">
          <div class="count-number" style="color:${colors[i]}">—</div>
          <div class="count-op">${ops[i]}</div>
        </div>`;
    }
  }
}

// ════════════════ HELPERS ════════════════
async function authGet(path) {
  try {
    const res = await fetch(BASE + path, {
      headers: { 'Authorization': `Bearer ${JWT_TOKEN}` }
    });
    return await res.json();
  } catch (e) {
    return [];
  }
}

function renderHistoryTable(containerId, data) {
  const el = document.getElementById(containerId);
  if (!data || data.length === 0) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-text">No records found</div>
      </div>`;
    return;
  }
  const rows = data.map(d => `
    <tr>
      <td><span class="badge badge-op">${d.operation || '—'}</span></td>
      <td>${d.thisValue ?? '—'} ${d.thisUnit ?? ''}</td>
      <td>${d.thatValue ?? '—'} ${d.thatUnit ?? ''}</td>
      <td>${d.resultValue ?? d.resultString ?? '—'} ${d.resultUnit ?? ''}</td>
      <td><span class="badge ${d.error ? 'badge-err' : 'badge-ok'}">${d.error ? 'error' : 'ok'}</span></td>
    </tr>`).join('');

  el.innerHTML = `
    <table class="history-table">
      <thead>
        <tr>
          <th>Operation</th>
          <th>Input 1</th>
          <th>Input 2</th>
          <th>Result</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function showMsg(el, type, text) {
  el.className   = `msg ${type}`;
  el.textContent = text;
}

function showResult(el, value, error, unit) {
  el.classList.add('show');
  if (error) {
    el.innerHTML = `
      <div class="result-label">Result</div>
      <div class="result-error">⚠ ${error}</div>`;
  } else {
    el.innerHTML = `
      <div class="result-label">Result</div>
      <div class="result-value">${value}</div>
      ${unit !== undefined ? `<div class="result-unit">${unit}</div>` : ''}`;
  }
}

// Enter key → login
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const authVisible = document.getElementById('auth-page').style.display !== 'none';
    const loginVisible = document.getElementById('login-form').style.display !== 'none';
    if (authVisible && loginVisible) doLogin();
  }
});