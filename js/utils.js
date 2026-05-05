// =============================================
// Utility functions
// =============================================

function showToast(msg, type = 'default') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success: '✅', error: '❌', default: 'ℹ️', warning: '⚠️' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${icons[type] || icons.default}</span><span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; t.style.transition = '0.3s';
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

function showLoading(show) {
  document.getElementById('loading-overlay')?.classList.toggle('hidden', !show);
}

function openBottomSheet(html) {
  document.getElementById('bottom-sheet-content').innerHTML = html;
  document.getElementById('bottom-sheet').classList.add('open');
}

function closeBottomSheet() {
  document.getElementById('bottom-sheet').classList.remove('open');
}

function showConfirm({ icon='⚠️', title, desc, actionLabel='Evet', actionClass='btn-danger', onConfirm }) {
  document.getElementById('confirm-icon').textContent  = icon;
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-desc').textContent  = desc;
  const btn = document.getElementById('confirm-action-btn');
  btn.textContent = actionLabel;
  btn.className = `btn ${actionClass} btn-full btn-lg`;
  btn.onclick = () => { closeConfirmSheet(); onConfirm(); };
  document.getElementById('confirm-sheet').classList.add('open');
}

function closeConfirmSheet() {
  document.getElementById('confirm-sheet').classList.remove('open');
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('sosyal_theme', newTheme);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
  // Update map tiles if map is initialized
  if (window.leafletMap) updateMapTiles();
}

function loadTheme() {
  const saved = localStorage.getItem('sosyal_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = saved === 'dark' ? '🌙' : '☀️';
}

function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function formatDuration(minutes) {
  if (minutes < 60) return `${Math.round(minutes)} dk`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}s ${m}dk`;
}

function formatDurationSeconds(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}

function formatTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'şimdi';
  if (mins < 60)  return `${mins}dk önce`;
  if (hours < 24) return `${hours}sa önce`;
  if (days < 7)   return `${days}g önce`;
  return new Date(dateStr).toLocaleDateString('tr-TR', { day:'numeric', month:'short' });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric' });
}

function formatEventDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('tr-TR', { weekday:'long', day:'numeric', month:'long' });
}

function difficultyLabel(d) {
  const map = { easy: 'Kolay', medium: 'Orta', hard: 'Zor' };
  return map[d] || d;
}

function vehicleLabel(v) {
  const map = { bicycle:'Bisiklet', motorcycle:'Motosiklet', both:'Her ikisi' };
  return map[v] || v;
}

function avatarInitials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();
}

function renderAvatar(profile, size = 'md') {
  if (profile?.avatar_url) {
    return `<div class="avatar avatar-${size}"><img src="${profile.avatar_url}" alt="${profile.full_name}"></div>`;
  }
  return `<div class="avatar avatar-${size}" style="background:var(--primary-dim);color:var(--primary)">${avatarInitials(profile?.full_name || '?')}</div>`;
}

// Haversine distance between two coords [lat,lng]
function calcDistance(c1, c2) {
  const R = 6371;
  const dLat = (c2[0] - c1[0]) * Math.PI / 180;
  const dLon = (c2[1] - c1[1]) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(c1[0]*Math.PI/180) * Math.cos(c2[0]*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Debounce
function debounce(fn, delay) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// Switch tabs
function switchTab(prefix, tabName, btn) {
  document.querySelectorAll(`#${prefix}-${tabName}`).forEach(() => {});
  // hide all tab contents with this prefix
  document.querySelectorAll(`[id^="${prefix}-"]`).forEach(el => {
    if (el.classList.contains('tab-content')) el.classList.remove('active');
  });
  const target = document.getElementById(`${prefix}-${tabName}`);
  if (target) target.classList.add('active');
  // update buttons
  if (btn) {
    btn.closest('.tabs')?.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
}
