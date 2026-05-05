// =============================================
// PROFILE PAGE (own profile)
// =============================================

const DEMO_BADGES = [
  { name:'İlk Sürüş', icon:'🚴', color:'#22c55e', earned: true },
  { name:'50 KM Kulübü', icon:'⭐', color:'#f97316', earned: true },
  { name:'100 KM Kulübü', icon:'🏆', color:'#eab308', earned: true },
  { name:'500 KM Veteran', icon:'💎', color:'#3b82f6', earned: true },
  { name:'Sosyal Kelebek', icon:'🦋', color:'#ec4899', earned: true },
  { name:'Topluluk Lideri', icon:'🤝', color:'#14b8a6', earned: false },
  { name:'1000 KM Efsane', icon:'👑', color:'#8b5cf6', earned: false },
  { name:'Rota Paylaşımcı', icon:'🗺️', color:'#f97316', earned: false },
];

let profileLoaded = false;

async function loadProfilePage() {
  const user = currentUser || JSON.parse(localStorage.getItem('sosyal_demo_user') || 'null');
  if (!user) return;

  document.getElementById('profile-header-name').textContent = user.username || user.full_name || 'Profil';

  const content = document.getElementById('profile-content');
  if (!content) return;

  const earnedBadges = DEMO_BADGES.filter(b => b.earned);

  content.innerHTML = `
    <!-- Profile header -->
    <div class="profile-header">
      <!-- Avatar -->
      <div style="position:relative;display:inline-block">
        ${renderAvatar(user, '2xl')}
        <button style="position:absolute;bottom:2px;right:2px;width:28px;height:28px;background:var(--primary);border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;border:2px solid var(--bg2)" onclick="editAvatar()">✏️</button>
      </div>
      <div class="profile-name">${user.full_name || '—'}</div>
      <div class="profile-username">@${user.username || '—'}</div>
      <div class="profile-location">📍 ${user.city || 'İstanbul'} &nbsp;·&nbsp; ${vehicleLabel(user.vehicle_type || 'both')}</div>
      ${user.bio ? `<p class="profile-bio">${user.bio}</p>` : ''}

      <!-- Stats -->
      <div class="profile-stats-row">
        <div class="profile-stat">
          <div class="val">${user.total_km ? parseFloat(user.total_km).toFixed(0) : 1247}</div>
          <div class="lbl">km</div>
        </div>
        <div class="profile-stat">
          <div class="val">${user.total_rides || 48}</div>
          <div class="lbl">Sürüş</div>
        </div>
        <div class="profile-stat">
          <div class="val">${user.follower_count || 234}</div>
          <div class="lbl">Takipçi</div>
        </div>
        <div class="profile-stat">
          <div class="val">${user.following_count || 87}</div>
          <div class="lbl">Takip</div>
        </div>
      </div>

      <!-- Action buttons -->
      <div style="display:flex;gap:8px;justify-content:center;margin-top:4px">
        <button class="btn btn-outline btn-sm" onclick="showEditProfile()">✏️ Düzenle</button>
        <button class="btn btn-outline btn-sm" onclick="navigate('messages')">💬 Mesajlar</button>
      </div>
    </div>

    <!-- Badges -->
    <div style="padding:14px 16px;border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <span style="font-weight:700;font-size:0.9375rem">🏅 Rozetler</span>
        <span style="font-size:0.8125rem;color:var(--text3)">${earnedBadges.length}/${DEMO_BADGES.length}</span>
      </div>
      <div style="display:flex;gap:10px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px">
        ${DEMO_BADGES.map(b => `
          <div style="flex-shrink:0;text-align:center;opacity:${b.earned ? 1 : 0.3};width:60px">
            <div style="width:50px;height:50px;border-radius:14px;background:var(--card);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:22px;margin:0 auto 4px">${b.icon}</div>
            <div style="font-size:0.625rem;font-weight:700;color:var(--text2);line-height:1.2">${b.name}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('pr', 'rides', this)">Sürüşler</button>
      <button class="tab-btn" onclick="switchTab('pr', 'routes', this)">Rotalar</button>
      <button class="tab-btn" onclick="switchTab('pr', 'events', this)">Etkinlikler</button>
      <button class="tab-btn" onclick="switchTab('pr', 'saved', this)">Kaydettiklerim</button>
    </div>

    <div id="pr-rides" class="tab-content active">
      ${renderRideHistory()}
    </div>

    <div id="pr-routes" class="tab-content">
      <div class="explore-grid">
        ${DEMO_EXPLORE_ROUTES.slice(0,4).map(r => renderRouteCard(r)).join('')}
      </div>
    </div>

    <div id="pr-events" class="tab-content">
      <div style="padding:16px">
        ${DEMO_EVENTS_LIST.slice(0,3).map(e => renderEventCard(e)).join('')}
      </div>
    </div>

    <div id="pr-saved" class="tab-content">
      <div class="explore-grid">
        ${DEMO_EXPLORE_ROUTES.slice(2,6).map(r => renderRouteCard(r)).join('')}
      </div>
    </div>
  `;

  profileLoaded = true;
}

function renderRideHistory() {
  const rides = [
    { title:'Sabah Turu', km:24.5, duration:92, avg_speed:16.0, date:'2026-05-05T07:00:00Z', vehicle:'bicycle', max_speed:28.4 },
    { title:'Akşam Döngüsü', km:15.2, duration:55, avg_speed:16.6, date:'2026-05-03T18:30:00Z', vehicle:'bicycle', max_speed:32.1 },
    { title:'Boğaz Turlaması', km:38.8, duration:145, avg_speed:16.1, date:'2026-04-28T09:00:00Z', vehicle:'bicycle', max_speed:41.5 },
    { title:'MTB Macerası', km:22.1, duration:110, avg_speed:12.1, date:'2026-04-21T07:30:00Z', vehicle:'bicycle', max_speed:35.8 },
    { title:'Şehir Keşfi', km:18.7, duration:72, avg_speed:15.6, date:'2026-04-14T17:00:00Z', vehicle:'bicycle', max_speed:27.3 },
  ];

  return rides.map(r => `
    <div style="display:flex;align-items:center;gap:14px;padding:14px 16px;border-bottom:1px solid var(--border);cursor:pointer">
      <div style="width:48px;height:48px;border-radius:12px;background:var(--primary-dim);border:1px solid var(--primary);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">
        ${r.vehicle === 'bicycle' ? '🚴' : '🏍️'}
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:0.9375rem;margin-bottom:3px">${r.title}</div>
        <div style="font-size:0.8125rem;color:var(--text3)">${formatTimeAgo(r.date)}</div>
        <div class="stat-row" style="margin-top:4px">
          <div class="stat-item">📏 <strong>${r.km}km</strong></div>
          <div class="stat-item">⏱️ ${formatDuration(r.duration)}</div>
          <div class="stat-item">⚡ ${r.avg_speed}km/s</div>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:1rem;font-weight:800;color:var(--primary)">${r.km}km</div>
        <div style="font-size:0.75rem;color:var(--text3)">max ${r.max_speed}</div>
      </div>
    </div>
  `).join('');
}

function showEditProfile() {
  const user = currentUser || JSON.parse(localStorage.getItem('sosyal_demo_user') || '{}');
  openBottomSheet(`
    <h3 style="font-size:1.125rem;font-weight:800;margin-bottom:16px">Profili Düzenle ✏️</h3>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="form-group">
        <label class="form-label">Ad Soyad</label>
        <input type="text" class="input" id="edit-fullname" value="${user.full_name || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Bio</label>
        <textarea class="input input-area" id="edit-bio" placeholder="Kendinizi tanıtın..." style="min-height:80px">${user.bio || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Şehir</label>
        <input type="text" class="input" id="edit-city" value="${user.city || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Araç Türü</label>
        <select class="select" id="edit-vehicle">
          <option value="bicycle" ${user.vehicle_type === 'bicycle' ? 'selected' : ''}>🚴 Bisiklet</option>
          <option value="motorcycle" ${user.vehicle_type === 'motorcycle' ? 'selected' : ''}>🏍️ Motosiklet</option>
          <option value="both" ${user.vehicle_type === 'both' ? 'selected' : ''}>⚡ Her ikisi</option>
        </select>
      </div>
      <button class="btn btn-primary btn-full btn-lg" onclick="saveProfile()">Kaydet</button>
    </div>
  `);
}

async function saveProfile() {
  const fullName  = document.getElementById('edit-fullname')?.value.trim();
  const bio       = document.getElementById('edit-bio')?.value.trim();
  const city      = document.getElementById('edit-city')?.value.trim();
  const vehicle   = document.getElementById('edit-vehicle')?.value;

  showLoading(true);
  try {
    if (supabaseClient && currentUser) {
      const { error } = await supabaseClient.from('profiles').update({ full_name:fullName, bio, city, vehicle_type:vehicle }).eq('id', currentUser.id);
      if (error) throw error;
      currentUser = { ...currentUser, full_name:fullName, bio, city, vehicle_type:vehicle };
    } else {
      const stored = JSON.parse(localStorage.getItem('sosyal_demo_user') || '{}');
      localStorage.setItem('sosyal_demo_user', JSON.stringify({ ...stored, full_name:fullName, bio, city, vehicle_type:vehicle }));
    }
    closeBottomSheet();
    profileLoaded = false;
    loadProfilePage();
    showToast('Profil güncellendi!', 'success');
  } catch(e) {
    showToast(e.message, 'error');
  } finally {
    showLoading(false);
  }
}

function editAvatar() {
  showToast('Fotoğraf yükleme yakında! 📸', 'default');
}
