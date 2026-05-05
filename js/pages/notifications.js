// =============================================
// NOTIFICATIONS PAGE
// =============================================

const DEMO_NOTIFICATIONS = [
  { id:'n1', type:'follow', from_user:{ full_name:'Ahmet Kaya', username:'ahmet_k' }, message:'seni takip etmeye başladı', time:'2026-05-05T08:30:00Z', is_read:false },
  { id:'n2', type:'like', from_user:{ full_name:'Zeynep Taşkın', username:'zeynep_t' }, message:'"Sabah Turu" sürüşünü beğendi', time:'2026-05-04T19:00:00Z', is_read:false },
  { id:'n3', type:'comment', from_user:{ full_name:'Mert Yıldız', username:'mert_y' }, message:'"Belgrad Ormanı Rotası"na yorum yaptı: "Muhteşem!"', time:'2026-05-04T15:30:00Z', is_read:false },
  { id:'n4', type:'event', from_user:{ full_name:'İstanbul MTB', username:'istanbul_mtb' }, message:'"Pazar MTB Turu" etkinliğine davet edildin', time:'2026-05-03T10:00:00Z', is_read:true },
  { id:'n5', type:'follow', from_user:{ full_name:'Can Boran', username:'can_b' }, message:'seni takip etmeye başladı', time:'2026-05-03T09:15:00Z', is_read:true },
  { id:'n6', type:'like', from_user:{ full_name:'Ayşe Demir', username:'ayse_d' }, message:'"Boğaz Turu" rotanı beğendi', time:'2026-05-02T16:00:00Z', is_read:true },
  { id:'n7', type:'comment', from_user:{ full_name:'Burak Şahin', username:'burak_s' }, message:'sürüşüne yorum yaptı: "Harika gidiş!"', time:'2026-05-02T11:00:00Z', is_read:true },
  { id:'n8', type:'event', from_user:{ full_name:'Boğaz Motor', username:'bogaz_motor' }, message:'"Motor Konvoyu" etkinliğine davet edildin', time:'2026-05-01T14:00:00Z', is_read:true },
];

function loadNotificationsPage() {
  const content = document.getElementById('notifications-content');
  if (!content) return;

  const unread = DEMO_NOTIFICATIONS.filter(n => !n.is_read);
  const read   = DEMO_NOTIFICATIONS.filter(n =>  n.is_read);

  let html = '';
  if (unread.length > 0) {
    html += `<div style="padding:10px 16px 4px"><span style="font-size:0.75rem;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:0.06em">Yeni (${unread.length})</span></div>`;
    html += unread.map(renderNotification).join('');
  }
  if (read.length > 0) {
    html += `<div style="padding:10px 16px 4px;margin-top:4px"><span style="font-size:0.75rem;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:0.06em">Daha Önce</span></div>`;
    html += read.map(renderNotification).join('');
  }
  if (DEMO_NOTIFICATIONS.length === 0) {
    html = `<div class="empty-state"><div class="empty-icon">🔔</div><h3 class="empty-title">Bildirim yok</h3><p class="empty-desc">Takipçiler, beğeniler ve yorumlar burada görünür.</p></div>`;
  }

  content.innerHTML = html;
}

function renderNotification(n) {
  const icons = { follow:'👤', like:'❤️', comment:'💬', event:'📅', community_invite:'👥' };
  const iconBg = { follow:'follow', like:'like', comment:'comment', event:'event' };
  const av = renderAvatar(n.from_user, 'md');

  return `
    <div class="notification-item ${n.is_read ? '' : 'unread'}" onclick="notificationAction(${JSON.stringify(n).replace(/"/g,'&quot;')})">
      <div class="notification-icon ${iconBg[n.type] || ''}">
        ${icons[n.type] || '🔔'}
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
        ${av}
        <div class="notification-body">
          <div class="notification-text"><strong>${n.from_user?.full_name || 'Biri'}</strong> ${n.message}</div>
          <div class="notification-time">${formatTimeAgo(n.time)}</div>
        </div>
      </div>
      ${!n.is_read ? '<div class="notification-unread-dot"></div>' : ''}
    </div>
  `;
}

function notificationAction(n) {
  n.is_read = true;
  if (n.type === 'follow')  navigate('user-profile', n.from_user);
  if (n.type === 'like')    navigate('explore');
  if (n.type === 'comment') navigate('explore');
  if (n.type === 'event')   navigate('event-detail', { title: 'Etkinlik' });
}

function markAllRead() {
  DEMO_NOTIFICATIONS.forEach(n => n.is_read = true);
  loadNotificationsPage();
  const badge = document.getElementById('notif-badge');
  if (badge) badge.style.display = 'none';
  showToast('Tümü okundu olarak işaretlendi', 'success');
}
