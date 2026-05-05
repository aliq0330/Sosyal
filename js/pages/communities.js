// =============================================
// COMMUNITIES PAGE
// =============================================

const DEMO_COMMUNITIES = [
  { id:'c1', name:'İstanbul MTB', slug:'istanbul-mtb', description:'İstanbul\'un dağ bisikleti topluluğu. Her hafta sonu sürüş düzenliyoruz.', vehicle_type:'bicycle', city:'İstanbul', member_count:1247, cover:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', emoji:'🏔️', joined:true },
  { id:'c2', name:'Boğaz Motor Tutkunları', slug:'bogaz-motor', description:'Boğaz hattında motor sürüşleri ve etkinlikler.', vehicle_type:'motorcycle', city:'İstanbul', member_count:892, cover:'https://images.unsplash.com/photo-1544191696-15693072e43b?w=600&q=80', emoji:'🏍️', joined:true },
  { id:'c3', name:'Gravel İstanbul', slug:'gravel-istanbul', description:'Gravel bisiklet tutkunları için özel topluluk.', vehicle_type:'bicycle', city:'İstanbul', member_count:456, cover:'https://images.unsplash.com/photo-1476158085676-e67f57ed9ed7?w=600&q=80', emoji:'🪨', joined:false },
  { id:'c4', name:'Enduro TR', slug:'enduro-tr', description:'Türkiye\'nin enduro motorsiklet topluluğu.', vehicle_type:'motorcycle', city:'Türkiye geneli', member_count:3210, cover:'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80', emoji:'💥', joined:false },
  { id:'c5', name:'İzmir Bisiklet', slug:'izmir-bisiklet', description:'İzmir\'in en büyük bisiklet topluluğu.', vehicle_type:'bicycle', city:'İzmir', member_count:678, cover:'https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=600&q=80', emoji:'🚴', joined:false },
  { id:'c6', name:'Bursa Dağcı Bisikletçiler', slug:'bursa-mtb', description:'Uludağ eteklerinde MTB sürüşleri.', vehicle_type:'bicycle', city:'Bursa', member_count:234, cover:'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=80', emoji:'🏔️', joined:false },
];

let commLoaded = false;

function loadCommunitiesPage() {
  if (commLoaded) return;
  loadCommunityTab('mine');
  commLoaded = true;
}

function loadCommunityTab(tab) {
  const mine     = document.getElementById('communities-mine-content');
  const discover = document.getElementById('communities-discover-content');
  const nearby   = document.getElementById('communities-nearby-content');

  const joined  = DEMO_COMMUNITIES.filter(c => c.joined);
  const others  = DEMO_COMMUNITIES.filter(c => !c.joined);

  if (mine) {
    if (joined.length === 0) {
      mine.innerHTML = `<div class="empty-state"><div class="empty-icon">👥</div><h3 class="empty-title">Henüz bir topluluğa katılmadın</h3><p class="empty-desc">Keşfet sekmesinden sana uygun toplulukları bul!</p></div>`;
    } else {
      mine.innerHTML = `<div class="community-grid">${joined.map(c => renderCommunityCard(c)).join('')}</div>`;
    }
  }
  if (discover) {
    discover.innerHTML = `
      <div class="section-header"><span class="section-title">Sana Önerilen</span></div>
      <div class="community-grid">${DEMO_COMMUNITIES.map(c => renderCommunityCard(c)).join('')}</div>
    `;
  }
  if (nearby) {
    nearby.innerHTML = `
      <div class="section-header"><span class="section-title">Yakınındaki Topluluklar 📍</span></div>
      <div class="community-grid">${DEMO_COMMUNITIES.filter(c => c.city.includes('İstanbul')).map(c => renderCommunityCard(c)).join('')}</div>
    `;
  }
}

function renderCommunityCard(comm) {
  return `
    <div class="community-card" onclick="navigate('community-detail', ${encodeDataAttr(comm)})">
      <div class="card-cover" style="height:90px">
        ${comm.cover ? `<img src="${comm.cover}" alt="${comm.name}" loading="lazy">` : `<div style="width:100%;height:100%;background:var(--card2);display:flex;align-items:center;justify-content:center;font-size:36px">${comm.emoji}</div>`}
        <div class="card-avatar">${comm.emoji}</div>
      </div>
      <div class="card-info" style="padding:24px 12px 10px">
        <div class="card-name">${comm.name}</div>
        <div class="card-meta">${comm.member_count.toLocaleString('tr-TR')} üye · ${comm.city}</div>
        ${comm.joined ? '<div style="margin-top:5px"><span class="badge badge-secondary">✓ Üyesin</span></div>' : ''}
      </div>
    </div>
  `;
}

// ---- Community Detail ----
function loadCommunityDetail(data) {
  if (!data) return;
  const content = document.getElementById('community-detail-content');
  if (!content) return;

  const posts = [
    { user:{ full_name:'Ahmet K.', username:'ahmet_k' }, content:'Herkese merhaba! Bu haftaki sürüş için hava durumu mükemmel görünüyor 🌤️', time:'2026-05-04T09:00:00Z', likes:23, comments:7 },
    { user:{ full_name:'Zeynep T.', username:'zeynep_t' }, content:'Dün gördüğümüz manzara inanılmazdı! Fotoğrafları paylaşıyorum 📸', time:'2026-05-03T17:00:00Z', likes:67, comments:14 },
    { user:{ full_name:'Can B.', username:'can_b' }, content:'Yeni üyelere hoşgeldiniz! Pazar günkü etkinliği kaçırmayın!', time:'2026-05-02T12:00:00Z', likes:34, comments:5 },
  ];

  const routes = DEMO_EXPLORE_ROUTES.slice(0,4);
  const events = DEMO_EVENTS_LIST.slice(0,2);

  content.innerHTML = `
    <!-- Cover -->
    <div class="community-cover" style="height:220px;position:relative;overflow:hidden">
      ${data.cover
        ? `<img src="${data.cover}" alt="${data.name}" style="width:100%;height:100%;object-fit:cover">`
        : `<div style="width:100%;height:100%;background:linear-gradient(135deg,var(--bg2),var(--card));display:flex;align-items:center;justify-content:center;font-size:80px">${data.emoji || '👥'}</div>`}
      <div class="community-cover-overlay"></div>
      <div class="community-cover-info">
        <div class="community-name">${data.name}</div>
        <div class="community-meta">${data.member_count?.toLocaleString('tr-TR') || '0'} üye &nbsp;·&nbsp; ${data.city || ''} &nbsp;·&nbsp; ${vehicleLabel(data.vehicle_type)}</div>
      </div>
      <div class="community-join-btn" style="position:absolute;bottom:16px;right:16px">
        <button class="btn ${data.joined ? 'btn-outline' : 'btn-primary'} btn-sm" id="community-join-btn" onclick="toggleJoinCommunity('${data.id}', this)">
          ${data.joined ? '✓ Üyesin' : '+ Katıl'}
        </button>
      </div>
    </div>

    <!-- Description -->
    <div style="padding:16px;border-bottom:1px solid var(--border)">
      <p style="color:var(--text2);font-size:0.9375rem;line-height:1.6">${data.description || ''}</p>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('cd', 'feed', this)">Akış</button>
      <button class="tab-btn" onclick="switchTab('cd', 'routes', this)">Rotalar</button>
      <button class="tab-btn" onclick="switchTab('cd', 'events', this)">Etkinlikler</button>
      <button class="tab-btn" onclick="switchTab('cd', 'members', this)">Üyeler</button>
    </div>

    <div id="cd-feed" class="tab-content active">
      <div class="explore-feed">
        ${posts.map(p => `
          <div class="feed-post">
            <div class="feed-post-header">
              ${renderAvatar(p.user, 'md')}
              <div class="feed-post-meta">
                <div class="feed-post-name">${p.user.full_name}</div>
                <div class="feed-post-time">${formatTimeAgo(p.time)}</div>
              </div>
            </div>
            <p class="feed-post-content">${p.content}</p>
            <div class="feed-actions">
              <button class="feed-action" onclick="toggleLike(this)">❤️ ${p.likes}</button>
              <button class="feed-action">💬 ${p.comments}</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div id="cd-routes" class="tab-content">
      <div class="explore-grid">${routes.map(r => renderRouteCard(r)).join('')}</div>
    </div>

    <div id="cd-events" class="tab-content">
      <div style="padding:16px">
        ${events.map(e => renderEventCard(e)).join('')}
      </div>
    </div>

    <div id="cd-members" class="tab-content">
      <div style="padding:16px;display:flex;flex-direction:column;gap:0">
        ${[
          { full_name:'Ahmet Kaya', username:'ahmet_k', city:'İstanbul', km:1245, role:'admin' },
          { full_name:'Zeynep Taşkın', username:'zeynep_t', city:'İstanbul', km:876, role:'moderator' },
          { full_name:'Can Boran', username:'can_b', city:'İstanbul', km:532, role:'member' },
          { full_name:'Mert Yıldız', username:'mert_y', city:'İstanbul', km:423, role:'member' },
          { full_name:'Ayşe Demir', username:'ayse_d', city:'Bursa', km:298, role:'member' },
        ].map(m => `
          <div style="display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="navigate('user-profile', ${encodeDataAttr(m)})">
            ${renderAvatar(m, 'md')}
            <div style="flex:1">
              <div style="font-weight:700;color:var(--text)">${m.full_name} ${m.role === 'admin' ? '<span class="badge badge-primary">Admin</span>' : m.role === 'moderator' ? '<span class="badge badge-info">Mod</span>' : ''}</div>
              <div style="font-size:0.8125rem;color:var(--text3)">@${m.username} · ${m.km} km</div>
            </div>
            <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();navigate('chat', ${encodeDataAttr(m)})">Mesaj</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

async function toggleJoinCommunity(id, btn) {
  const isJoined = btn.textContent.includes('Üyesin');
  if (isJoined) {
    btn.textContent = '+ Katıl';
    btn.className = 'btn btn-primary btn-sm';
    showToast('Topluluktan ayrıldın', 'default');
  } else {
    btn.textContent = '✓ Üyesin';
    btn.className = 'btn btn-outline btn-sm';
    showToast('Topluluğa katıldın! 🎉', 'success');
  }
  if (supabaseClient && currentUser) {
    if (isJoined) {
      await supabaseClient.from('community_members').delete().eq('community_id', id).eq('user_id', currentUser.id);
    } else {
      await supabaseClient.from('community_members').insert({ community_id: id, user_id: currentUser.id });
    }
  }
}

// ---- Event Detail ----
function loadEventDetail(data) {
  if (!data) return;
  document.getElementById('event-detail-title').textContent = data.title || 'Etkinlik';
  const content = document.getElementById('event-detail-content');
  if (!content) return;

  const d = new Date(data.date || data.start_datetime || Date.now());
  const participants = [
    { full_name:'Ahmet K.', username:'ahmet_k' },
    { full_name:'Zeynep T.', username:'zeynep_t' },
    { full_name:'Can B.', username:'can_b' },
    { full_name:'Mert Y.', username:'mert_y' },
  ];

  content.innerHTML = `
    <!-- Map -->
    <div class="event-detail-map">
      <div id="event-detail-map"></div>
      <div style="position:absolute;top:12px;right:12px">
        <span class="badge badge-${data.vehicle === 'bicycle' ? 'secondary' : 'primary'}">${vehicleLabel(data.vehicle || 'both')}</span>
      </div>
    </div>

    <!-- Title & meta -->
    <div style="padding:16px;border-bottom:1px solid var(--border)">
      <h1 style="font-size:1.375rem;font-weight:900;margin-bottom:6px">${data.title}</h1>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span class="badge difficulty-${data.difficulty || 'medium'}">${difficultyLabel(data.difficulty || 'medium')}</span>
        <span class="badge badge-ghost">${data.community || 'Açık Etkinlik'}</span>
      </div>
    </div>

    <!-- Info grid -->
    <div class="event-info-grid" style="padding:16px">
      <div class="event-info-item">
        <span class="event-info-icon">📅</span>
        <div>
          <div class="event-info-label">Tarih</div>
          <div class="event-info-value">${d.toLocaleDateString('tr-TR', {day:'numeric',month:'long'})}</div>
        </div>
      </div>
      <div class="event-info-item">
        <span class="event-info-icon">🕐</span>
        <div>
          <div class="event-info-label">Saat</div>
          <div class="event-info-value">${d.toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit'})}</div>
        </div>
      </div>
      <div class="event-info-item">
        <span class="event-info-icon">📍</span>
        <div>
          <div class="event-info-label">Şehir</div>
          <div class="event-info-value">${data.city || 'İstanbul'}</div>
        </div>
      </div>
      <div class="event-info-item">
        <span class="event-info-icon">👥</span>
        <div>
          <div class="event-info-label">Katılımcı</div>
          <div class="event-info-value">${data.participants || 0}/${data.max || '∞'}</div>
        </div>
      </div>
    </div>

    <!-- Participants -->
    <div style="padding:0 16px 16px;border-bottom:1px solid var(--border)">
      <div style="font-size:0.875rem;font-weight:700;color:var(--text2);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">Katılımcılar</div>
      <div style="display:flex;align-items:center;gap:4px">
        ${participants.map(p => renderAvatar(p, 'sm')).join('')}
        <div class="participants-more">+${(data.participants || 20) - participants.length}</div>
      </div>
    </div>

    <!-- Description -->
    <div style="padding:16px;border-bottom:1px solid var(--border)">
      <p style="color:var(--text2);line-height:1.6">Bu etkinliğe katılmak için aşağıdaki butona tıklayabilirsiniz. Başlangıç noktasında toplanacağız ve birlikte süreceğiz!</p>
    </div>

    <!-- CTA -->
    <div style="padding:16px;display:flex;gap:12px">
      <button class="btn btn-primary btn-full btn-lg" id="event-join-btn" onclick="joinEvent('${data.id}', this)">
        🎉 Katıl
      </button>
      <button class="btn btn-outline btn-icon btn-lg" onclick="showToast('Etkinlik paylaşıldı!', \'success\')">🔗</button>
    </div>
  `;

  // Init event map
  setTimeout(() => {
    const mapEl = document.getElementById('event-detail-map');
    if (!mapEl) return;
    const coords = data.start_coordinates
      ? [data.start_coordinates.lat, data.start_coordinates.lng]
      : (DEMO_EVENTS.find(e => e.id === data.id) ? [DEMO_EVENTS.find(e=>e.id===data.id).lat, DEMO_EVENTS.find(e=>e.id===data.id).lng] : APP_CONFIG.defaultCoords);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const m = L.map('event-detail-map', { zoomControl:false, attributionControl:false }).setView(coords, 13);
    L.tileLayer(isDark ? MAP_TILES.dark : MAP_TILES.light, { maxZoom:19, subdomains:'abcd' }).addTo(m);
    const icon = L.divIcon({ className:'', html:`<div style="width:28px;height:28px;background:#ef4444;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;color:white;font-size:14px">🏁</div>`, iconSize:[28,28], iconAnchor:[14,14] });
    L.marker(coords, { icon }).addTo(m);
  }, 200);
}

async function joinEvent(id, btn) {
  const isJoined = btn.textContent.includes('Ayrıl');
  if (!isJoined) {
    btn.textContent = '✓ Katıldın';
    btn.className = 'btn btn-outline btn-full btn-lg';
    showToast('Etkinliğe katıldın! 🎉', 'success');
  } else {
    btn.textContent = '🎉 Katıl';
    btn.className = 'btn btn-primary btn-full btn-lg';
    showToast('Etkinlikten ayrıldın', 'default');
  }
}

// ---- Route Detail ----
function loadRouteDetail(data) {
  if (!data) return;
  const content = document.getElementById('route-detail-content');
  if (!content) return;

  content.innerHTML = `
    <!-- Map / Cover -->
    <div class="route-detail-map">
      <div id="route-detail-map" style="width:100%;height:100%"></div>
      <div style="position:absolute;top:var(--header-height);left:0;right:0;bottom:0;pointer-events:none">
        <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(0,0,0,0.8),transparent);padding:16px">
          <h1 style="font-size:1.375rem;font-weight:900;color:white;margin-bottom:6px">${data.title}</h1>
          <div style="display:flex;gap:6px">
            <span class="badge difficulty-${data.difficulty}">${difficultyLabel(data.difficulty)}</span>
            <span class="badge" style="background:rgba(255,255,255,0.15);color:white">${vehicleLabel(data.vehicle || data.vehicle_type || 'both')}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="route-detail-stats">
      <div class="route-detail-stat"><div class="val">${data.km || data.distance_km || 0}km</div><div class="lbl">Mesafe</div></div>
      <div class="route-detail-stat"><div class="val">${data.duration ? formatDuration(data.duration) : '—'}</div><div class="lbl">Süre</div></div>
      <div class="route-detail-stat"><div class="val">${data.elevation || '—'}m</div><div class="lbl">İniş</div></div>
      <div class="route-detail-stat"><div class="val">${data.likes || 0}</div><div class="lbl">Beğeni</div></div>
    </div>

    <!-- Author -->
    <div style="padding:14px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px">
      ${renderAvatar({ full_name: data.author || 'Sosyal User' }, 'md')}
      <div style="flex:1">
        <div style="font-weight:700;color:var(--text)">${data.author || 'Sosyal User'}</div>
        <div style="font-size:0.8125rem;color:var(--text3)">${data.city || ''}</div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="navigate('user-profile')">Profil</button>
    </div>

    <!-- Description -->
    <div style="padding:16px;border-bottom:1px solid var(--border)">
      <p style="color:var(--text2);line-height:1.6">${data.description || 'Bu rota hakkında açıklama henüz eklenmemiş.'}</p>
    </div>

    <!-- Photos placeholder -->
    <div style="padding:16px;border-bottom:1px solid var(--border)">
      <div style="font-weight:700;margin-bottom:10px">📷 Fotoğraflar</div>
      <div style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px">
        ${data.cover ? `<img src="${data.cover}" style="width:120px;height:90px;object-fit:cover;border-radius:8px;flex-shrink:0" loading="lazy">` : ''}
        <div style="width:120px;height:90px;background:var(--card);border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--text3);font-size:24px;border:2px dashed var(--border)">📷</div>
      </div>
    </div>

    <!-- Comments -->
    <div style="padding:16px">
      <div style="font-weight:700;margin-bottom:12px">💬 Yorumlar (${data.comments || 3})</div>
      ${[
        { user:'Mert Yıldız', text:'Muhteşem bir rota, geçen hafta denedim, tavsiye ederim!', time:'2026-05-01T10:00:00Z' },
        { user:'Ayşe Demir', text:'Zorluk seviyesi biraz daha zor aslında, dikkatli olun.', time:'2026-04-28T15:00:00Z' },
      ].map(c => `
        <div style="display:flex;gap:10px;margin-bottom:14px">
          ${renderAvatar({ full_name: c.user }, 'sm')}
          <div style="flex:1;background:var(--card);border-radius:12px;padding:10px 12px">
            <div style="font-weight:700;font-size:0.875rem;margin-bottom:4px">${c.user}</div>
            <div style="font-size:0.9rem;color:var(--text2)">${c.text}</div>
            <div style="font-size:0.75rem;color:var(--text3);margin-top:4px">${formatTimeAgo(c.time)}</div>
          </div>
        </div>
      `).join('')}
      <div style="display:flex;gap:8px">
        <input type="text" class="input" placeholder="Yorum yaz..." style="flex:1">
        <button class="btn btn-primary btn-icon" onclick="showToast('Yorum eklendi!', \'success\')">➤</button>
      </div>
    </div>

    <!-- CTA -->
    <div style="padding:16px;position:sticky;bottom:0;background:var(--bg2);border-top:1px solid var(--border)">
      <button class="btn btn-primary btn-full btn-lg" onclick="navigate('ride')">
        🚴 Bu Rotayı Sür
      </button>
    </div>
  `;

  // Init map
  setTimeout(() => {
    const mapEl = document.getElementById('route-detail-map');
    if (!mapEl) return;
    const coords = DEMO_ROUTES.find(r => r.id === data.id)
      ? [DEMO_ROUTES.find(r=>r.id===data.id).lat, DEMO_ROUTES.find(r=>r.id===data.id).lng]
      : APP_CONFIG.defaultCoords;
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const m = L.map('route-detail-map', { zoomControl:false, attributionControl:false }).setView(coords, 13);
    L.tileLayer(isDark ? MAP_TILES.dark : MAP_TILES.light, { maxZoom:19, subdomains:'abcd' }).addTo(m);
    // Fake route polyline
    const routePoints = Array.from({length:12}, (_, i) => [coords[0] + i*0.005 + (Math.random()-0.5)*0.003, coords[1] + i*0.003 + (Math.random()-0.5)*0.002]);
    L.polyline(routePoints, { color:'#22c55e', weight:4 }).addTo(m);
    const startIcon = L.divIcon({ className:'', html:`<div style="width:24px;height:24px;background:#22c55e;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;color:white;font-size:12px">S</div>`, iconSize:[24,24], iconAnchor:[12,12] });
    const endIcon   = L.divIcon({ className:'', html:`<div style="width:24px;height:24px;background:#ef4444;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;color:white;font-size:12px">F</div>`, iconSize:[24,24], iconAnchor:[12,12] });
    L.marker(routePoints[0], { icon: startIcon }).addTo(m);
    L.marker(routePoints[routePoints.length-1], { icon: endIcon }).addTo(m);
  }, 200);
}

// ---- User Profile ----
function loadUserProfile(data) {
  if (!data) return;
  document.getElementById('user-profile-header').textContent = data.full_name || 'Profil';
  const content = document.getElementById('user-profile-content');
  if (!content) return;

  content.innerHTML = `
    <div class="profile-header">
      ${renderAvatar({ full_name: data.full_name }, 'xl')}
      <div class="profile-name">${data.full_name || '—'}</div>
      <div class="profile-username">@${data.username || '—'}</div>
      <div class="profile-location">📍 ${data.city || 'İstanbul'}</div>
      <div class="profile-stats-row">
        <div class="profile-stat"><div class="val">${data.km || 532}</div><div class="lbl">KM</div></div>
        <div class="profile-stat"><div class="val">${data.followers || 143}</div><div class="lbl">Takipçi</div></div>
        <div class="profile-stat"><div class="val">${data.following || 67}</div><div class="lbl">Takip</div></div>
      </div>
      <div style="display:flex;gap:8px;margin-top:4px;justify-content:center">
        <button class="btn btn-primary" onclick="showToast('Takip edildi!','success')">👤 Takip Et</button>
        <button class="btn btn-outline btn-icon" onclick="navigate('chat', ${encodeDataAttr(data)})">💬</button>
      </div>
    </div>
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('up', 'posts', this)">Paylaşımlar</button>
      <button class="tab-btn" onclick="switchTab('up', 'routes', this)">Rotalar</button>
      <button class="tab-btn" onclick="switchTab('up', 'events', this)">Etkinlikler</button>
    </div>
    <div id="up-posts" class="tab-content active">
      <div class="empty-state"><div class="empty-icon">📝</div><h3 class="empty-title">Henüz paylaşım yok</h3></div>
    </div>
    <div id="up-routes" class="tab-content">
      <div class="explore-grid">${DEMO_EXPLORE_ROUTES.slice(0,2).map(r => renderRouteCard(r)).join('')}</div>
    </div>
    <div id="up-events" class="tab-content">
      <div class="empty-state"><div class="empty-icon">📅</div><h3 class="empty-title">Katıldığı etkinlik yok</h3></div>
    </div>
  `;
}
