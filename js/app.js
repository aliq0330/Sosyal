// =============================================
// App Controller — Navigation & Boot
// =============================================

let currentPage = 'map';
let pageHistory = [];
let currentUser = null;

// ---- Navigation ----
function navigate(pageId, data = null) {
  if (pageId === currentPage) return;

  // Push history (for back button)
  pageHistory.push(currentPage);

  const prev = document.getElementById('page-' + currentPage);
  const next = document.getElementById('page-' + pageId);

  if (!next) { console.warn('Page not found:', pageId); return; }

  if (prev) { prev.classList.remove('active'); }
  next.classList.add('active');
  currentPage = pageId;

  // Update bottom nav active state
  document.querySelectorAll('#bottom-nav .nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === pageId);
  });

  // Trigger page load
  onPageEnter(pageId, data);
}

function goBack() {
  if (pageHistory.length === 0) { navigate('map'); return; }
  const prev = pageHistory.pop();
  const curr = document.getElementById('page-' + currentPage);
  const target = document.getElementById('page-' + prev);
  if (curr) curr.classList.remove('active');
  if (target) target.classList.add('active');
  currentPage = prev;
  document.querySelectorAll('#bottom-nav .nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === prev);
  });
}

// Called when entering a page for the first time or revisiting
function onPageEnter(pageId, data) {
  switch (pageId) {
    case 'map':         initMapPage();              break;
    case 'explore':     loadExplorePage();          break;
    case 'ride':        initRidePage();             break;
    case 'communities': loadCommunitiesPage();      break;
    case 'profile':     loadProfilePage();          break;
    case 'notifications': loadNotificationsPage(); break;
    case 'messages':    loadMessagesPage();         break;
    case 'community-detail': loadCommunityDetail(data); break;
    case 'event-detail':     loadEventDetail(data);     break;
    case 'route-detail':     loadRouteDetail(data);     break;
    case 'chat':             openChat(data);             break;
    case 'share-ride':       loadShareRidePage();        break;
    case 'user-profile':     loadUserProfile(data);      break;
  }
}

// ---- Boot ----
document.addEventListener('DOMContentLoaded', async () => {
  loadTheme();

  // Auth check
  const isDemo = localStorage.getItem('sosyal_demo_mode');
  const loggedIn = await isLoggedIn();
  if (!isDemo && !loggedIn) {
    window.location.href = 'index.html';
    return;
  }

  // Load current user
  currentUser = await getCurrentUser();

  // Init first page
  navigate('map');

  // Load unread notification count
  loadNotificationBadge();
});

// ---- Notification badge ----
async function loadNotificationBadge() {
  if (localStorage.getItem('sosyal_demo_mode')) {
    const badge = document.getElementById('notif-badge');
    if (badge) badge.style.display = 'block';
    return;
  }
  if (!supabaseClient || !currentUser) return;
  const { count } = await supabaseClient
    .from('notifications').select('*', { count: 'exact', head: true })
    .eq('user_id', currentUser.id).eq('is_read', false);
  const badge = document.getElementById('notif-badge');
  if (badge) badge.style.display = count > 0 ? 'block' : 'none';
}

// ---- Settings bottom sheet ----
function showSettings() {
  openBottomSheet(`
    <h3 style="font-size:1.125rem;font-weight:800;margin-bottom:16px">Ayarlar ⚙️</h3>
    <div style="display:flex;flex-direction:column;gap:4px">
      <button class="btn btn-ghost btn-full" style="justify-content:flex-start;gap:12px;height:52px" onclick="toggleTheme();closeBottomSheet()">
        🌙 Tema Değiştir
      </button>
      <button class="btn btn-ghost btn-full" style="justify-content:flex-start;gap:12px;height:52px" onclick="closeBottomSheet();navigate('profile')">
        ✏️ Profili Düzenle
      </button>
      <button class="btn btn-ghost btn-full" style="justify-content:flex-start;gap:12px;height:52px">
        🔔 Bildirim Ayarları
      </button>
      <button class="btn btn-ghost btn-full" style="justify-content:flex-start;gap:12px;height:52px">
        🔒 Gizlilik
      </button>
      <div style="height:1px;background:var(--border);margin:8px 0"></div>
      <button class="btn btn-ghost btn-full" style="justify-content:flex-start;gap:12px;height:52px;color:var(--danger)" onclick="confirmLogout()">
        🚪 Çıkış Yap
      </button>
    </div>
  `);
}

function confirmLogout() {
  closeBottomSheet();
  showConfirm({
    icon: '🚪', title: 'Çıkış Yap',
    desc: 'Hesabından çıkmak istediğine emin misin?',
    actionLabel: 'Çıkış Yap', actionClass: 'btn-danger',
    onConfirm: logout
  });
}

function showCreateCommunity() {
  openBottomSheet(`
    <h3 style="font-size:1.125rem;font-weight:800;margin-bottom:16px">Topluluk Oluştur 👥</h3>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="form-group">
        <label class="form-label">Topluluk Adı</label>
        <input type="text" class="input" id="new-comm-name" placeholder="İstanbul MTB'ciler">
      </div>
      <div class="form-group">
        <label class="form-label">Açıklama</label>
        <textarea class="input input-area" id="new-comm-desc" placeholder="Topluluğunuzu tanıtın..." style="min-height:80px"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Araç Türü</label>
        <select class="select" id="new-comm-vehicle">
          <option value="bicycle">🚴 Bisiklet</option>
          <option value="motorcycle">🏍️ Motosiklet</option>
          <option value="both">⚡ Her ikisi</option>
          <option value="mtb">🏔️ MTB</option>
          <option value="road">🛣️ Yol Bisikleti</option>
          <option value="enduro">💥 Enduro</option>
        </select>
      </div>
      <button class="btn btn-primary btn-full btn-lg" onclick="submitCreateCommunity()">Oluştur</button>
    </div>
  `);
}

async function submitCreateCommunity() {
  const name = document.getElementById('new-comm-name')?.value.trim();
  const desc = document.getElementById('new-comm-desc')?.value.trim();
  const vehicle = document.getElementById('new-comm-vehicle')?.value;
  if (!name) { showToast('Topluluk adı gir', 'error'); return; }

  showLoading(true);
  try {
    if (supabaseClient && currentUser) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g,'-');
      const { error } = await supabaseClient.from('communities').insert({
        name, description: desc, vehicle_type: vehicle,
        slug: slug + '-' + Date.now(),
        created_by: currentUser.id
      });
      if (error) throw error;
    }
    closeBottomSheet();
    showToast('Topluluk oluşturuldu! 🎉', 'success');
    loadCommunitiesPage();
  } catch(e) {
    showToast('Hata: ' + e.message, 'error');
  } finally {
    showLoading(false);
  }
}
