// =============================================
// EXPLORE PAGE
// =============================================

let exploreCurrentFilter = 'all';
let exploreLoaded = false;

const DEMO_EXPLORE_ROUTES = [
  { id:'r1', title:'Belgrad Ormanı MTB', km:24.5, duration:90, difficulty:'medium', vehicle:'bicycle', likes:142, comments:23, city:'İstanbul', cover:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', road_type:'off-road' },
  { id:'r2', title:'Boğaz Manzaralı Yol', km:18.2, duration:65, difficulty:'easy', vehicle:'both', likes:89, comments:14, city:'İstanbul', cover:'https://images.unsplash.com/photo-1476158085676-e67f57ed9ed7?w=400&q=80', road_type:'asphalt' },
  { id:'r3', title:'Şile Sahil Parkuru', km:45.0, duration:180, difficulty:'medium', vehicle:'motorcycle', likes:203, comments:41, city:'İstanbul', cover:'https://images.unsplash.com/photo-1544191696-15693072e43b?w=400&q=80', road_type:'asphalt' },
  { id:'r4', title:'Uludağ Etekler', km:31.8, duration:140, difficulty:'hard', vehicle:'bicycle', likes:67, comments:9, city:'Bursa', cover:'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&q=80', road_type:'mixed' },
  { id:'r5', title:'Kazdağları Enduro', km:55.0, duration:240, difficulty:'hard', vehicle:'motorcycle', likes:318, comments:56, city:'Balıkesir', cover:'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80', road_type:'off-road' },
  { id:'r6', title:'İzmir Kordon Turu', km:12.0, duration:45, difficulty:'easy', vehicle:'bicycle', likes:91, comments:17, city:'İzmir', cover:'https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=400&q=80', road_type:'asphalt' },
];

const DEMO_EXPLORE_FEEDS = [
  {
    id:'f1', type:'ride_share',
    user:{ username:'ahmet_k', full_name:'Ahmet Kaya', avatar:null },
    content:'Sabah erkenden çıktım, Belgrad Ormanı bizi bekliyordu! Muhteşem bir MTB sürüşü 🌲🚴',
    ride:{ km:24.5, duration:92, avg_speed:16.0 },
    photos:['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'],
    likes:47, comments:12, time:'2026-05-05T06:30:00Z'
  },
  {
    id:'f2', type:'route_share',
    user:{ username:'zeynep_moto', full_name:'Zeynep Taşkın', avatar:null },
    content:'Yeni bir rota keşfettim! Karadeniz kıyısı boyunca muhteşem bir tur. Asfalt tertemiz, manzara paha biçilmez 🏍️',
    route:{ title:'Karadeniz Sahil Rotası', km:120.0, difficulty:'medium' },
    photos:[
      'https://images.unsplash.com/photo-1544191696-15693072e43b?w=600&q=80',
      'https://images.unsplash.com/photo-1476158085676-e67f57ed9ed7?w=600&q=80'
    ],
    likes:128, comments:34, time:'2026-05-04T15:45:00Z'
  },
  {
    id:'f3', type:'event',
    user:{ username:'istanbul_mtb', full_name:'İstanbul MTB Topluluğu', avatar:null },
    content:'Hafta sonu etkinliğimiz için kayıtlar açıldı! Pazar sabahı 07:00\'de Belgrad Ormanı girişinde buluşuyoruz 🎉',
    event:{ title:'Pazar MTB Turu', date:'2026-05-10T07:00:00Z', participants:28 },
    photos:['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80'],
    likes:89, comments:21, time:'2026-05-03T10:00:00Z'
  },
];

const DEMO_EVENTS_LIST = [
  { id:'e1', title:'Sabah MTB Turu', date:'2026-05-12T07:00:00Z', city:'İstanbul', participants:24, max:40, difficulty:'medium', vehicle:'bicycle', community:'İstanbul MTB', cover:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { id:'e2', title:'Boğaz Motor Konvoyu', date:'2026-05-18T09:00:00Z', city:'İstanbul', participants:67, max:100, difficulty:'easy', vehicle:'motorcycle', community:'İstanbul Motor Tutkunları', cover:'https://images.unsplash.com/photo-1544191696-15693072e43b?w=400&q=80' },
  { id:'e3', title:'Uludağ Enduro', date:'2026-05-25T08:00:00Z', city:'Bursa', participants:15, max:25, difficulty:'hard', vehicle:'motorcycle', community:'Enduro TR', cover:'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80' },
  { id:'e4', title:'Hafta Sonu Gravel Ride', date:'2026-06-01T07:30:00Z', city:'İstanbul', participants:31, max:50, difficulty:'medium', vehicle:'bicycle', community:'Gravel Istanbul', cover:'https://images.unsplash.com/photo-1476158085676-e67f57ed9ed7?w=400&q=80' },
];

function loadExplorePage() {
  if (exploreLoaded && exploreCurrentFilter === 'all') return;
  renderExploreContent(exploreCurrentFilter);
}

function exploreFilter(filter, el) {
  document.querySelectorAll('#page-explore .filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  exploreCurrentFilter = filter;
  renderExploreContent(filter);
}

function renderExploreContent(filter) {
  const loading = document.getElementById('explore-loading');
  const data    = document.getElementById('explore-data');
  if (!loading || !data) return;

  loading.style.display = 'grid';
  data.style.display = 'none';

  setTimeout(() => {
    loading.style.display = 'none';
    data.style.display = 'block';

    if (filter === 'routes' || filter === 'bicycle' || filter === 'motorcycle') {
      const routes = filter === 'routes' ? DEMO_EXPLORE_ROUTES :
        DEMO_EXPLORE_ROUTES.filter(r => r.vehicle === filter || r.vehicle === 'both');
      data.innerHTML = `<div class="explore-grid">${routes.map(renderRouteCard).join('')}</div>`;
    } else if (filter === 'events') {
      data.innerHTML = `
        <div class="section-header"><span class="section-title">Yaklaşan Etkinlikler 📅</span></div>
        <div style="display:flex;flex-direction:column;gap:0;padding:0 16px">
          ${DEMO_EVENTS_LIST.map(renderEventCard).join('')}
        </div>
      `;
    } else if (filter === 'rides') {
      data.innerHTML = `<div class="explore-feed">${DEMO_EXPLORE_FEEDS.map(renderFeedPost).join('')}</div>`;
    } else {
      // all: mix of routes + feed
      data.innerHTML = `
        <div class="section-header">
          <span class="section-title">🔥 Popüler Rotalar</span>
          <button class="section-action" onclick="exploreFilter('routes', document.querySelector('[data-f=routes]'))">Tümü</button>
        </div>
        <div style="overflow-x:auto;scrollbar-width:none;padding:0 16px 16px">
          <div style="display:flex;gap:12px;width:max-content">
            ${DEMO_EXPLORE_ROUTES.slice(0,4).map(r => `<div style="width:200px;flex-shrink:0">${renderRouteCard(r)}</div>`).join('')}
          </div>
        </div>
        <div class="divider"></div>
        <div class="section-header"><span class="section-title">📅 Yaklaşan Etkinlikler</span></div>
        <div style="padding:0 16px">
          ${DEMO_EVENTS_LIST.slice(0,2).map(renderEventCard).join('')}
        </div>
        <div class="divider" style="margin:8px 0"></div>
        <div class="section-header"><span class="section-title">📰 Topluluk Akışı</span></div>
        <div class="explore-feed">${DEMO_EXPLORE_FEEDS.map(renderFeedPost).join('')}</div>
      `;
    }
    exploreLoaded = true;
  }, 600);
}

function renderRouteCard(route) {
  const coverBg = route.cover
    ? `style="background-image:url('${route.cover}');background-size:cover;background-position:center"`
    : `style="background:var(--card2)"`;
  return `
    <div class="card card-hover route-card" onclick="navigate('route-detail', ${encodeDataAttr(route)})">
      <div class="card-cover" style="height:140px">
        <div style="width:100%;height:100%;${route.cover ? `background:url('${route.cover}') center/cover no-repeat` : 'background:var(--card2)'}"></div>
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.7))"></div>
        <div style="position:absolute;top:8px;left:8px;display:flex;gap:4px">
          <span class="badge difficulty-${route.difficulty}">${difficultyLabel(route.difficulty)}</span>
        </div>
        <div style="position:absolute;bottom:8px;left:8px;color:white;font-size:0.75rem;font-weight:700">${route.city || ''}</div>
      </div>
      <div class="card-body" style="padding:10px 12px">
        <div style="font-size:0.875rem;font-weight:700;color:var(--text);margin-bottom:5px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${route.title}</div>
        <div class="stat-row">
          <div class="stat-item">📏 <strong>${route.km}km</strong></div>
          <div class="stat-item">⏱️ <strong>${formatDuration(route.duration)}</strong></div>
        </div>
        <div class="stat-row" style="margin-top:6px">
          <div class="stat-item">❤️ ${route.likes}</div>
          <div class="stat-item">💬 ${route.comments}</div>
        </div>
      </div>
    </div>
  `;
}

function renderEventCard(event) {
  const d = new Date(event.date);
  const day = d.getDate();
  const month = d.toLocaleString('tr-TR', { month: 'short' });
  const time = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const pct  = Math.round((event.participants / event.max) * 100);
  return `
    <div class="card card-hover event-card" style="padding:14px;display:flex;gap:12px;margin-bottom:10px;cursor:pointer" onclick="navigate('event-detail', ${encodeDataAttr(event)})">
      <div class="event-date-badge">
        <span class="day">${day}</span>
        <span class="month">${month}</span>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-size:0.9375rem;font-weight:700;color:var(--text);margin-bottom:4px">${event.title}</div>
        <div style="font-size:0.8125rem;color:var(--text3);margin-bottom:6px">🕐 ${time} &nbsp;📍 ${event.city} &nbsp;👥 ${event.community || ''}</div>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:1;height:4px;background:var(--border);border-radius:2px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:var(--primary);border-radius:2px"></div>
          </div>
          <span style="font-size:0.75rem;font-weight:700;color:var(--text2)">${event.participants}/${event.max}</span>
        </div>
      </div>
      <span class="badge difficulty-${event.difficulty}">${difficultyLabel(event.difficulty)}</span>
    </div>
  `;
}

function renderFeedPost(post) {
  const av = renderAvatar(post.user, 'md');
  const photosHtml = post.photos?.length
    ? `<div class="feed-post-photos photos-${Math.min(post.photos.length, 3)}" style="margin-bottom:10px;border-radius:10px;overflow:hidden">
        ${post.photos.map(p => `<img src="${p}" alt="" loading="lazy">`).join('')}
      </div>` : '';

  let extraCard = '';
  if (post.ride) {
    extraCard = `
      <div class="ride-summary-card">
        <div class="ride-summary-stats">
          <div class="ride-summary-stat"><div class="val">${post.ride.km}km</div><div class="lbl">Mesafe</div></div>
          <div class="ride-summary-stat"><div class="val">${formatDuration(post.ride.duration)}</div><div class="lbl">Süre</div></div>
          <div class="ride-summary-stat"><div class="val">${post.ride.avg_speed}km/s</div><div class="lbl">Ort. Hız</div></div>
        </div>
      </div>`;
  }
  if (post.event) {
    extraCard = `
      <div class="ride-summary-card" style="cursor:pointer" onclick="navigate('event-detail',{id:'${post.event.title}'})">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:24px">📅</span>
          <div>
            <div style="font-weight:700;color:var(--text)">${post.event.title}</div>
            <div style="font-size:0.8125rem;color:var(--text3)">${formatDate(post.event.date)} &nbsp;·&nbsp; ${post.event.participants} katılımcı</div>
          </div>
        </div>
      </div>`;
  }

  return `
    <div class="feed-post">
      <div class="feed-post-header">
        ${av}
        <div class="feed-post-meta">
          <div class="feed-post-name">${post.user.full_name}</div>
          <div class="feed-post-time">@${post.user.username} · ${formatTimeAgo(post.time)}</div>
        </div>
        <button style="color:var(--text3);font-size:20px;padding:4px">⋮</button>
      </div>
      <p class="feed-post-content">${post.content}</p>
      ${photosHtml}
      ${extraCard}
      <div class="feed-actions">
        <button class="feed-action" onclick="toggleLike(this)">❤️ ${post.likes}</button>
        <button class="feed-action">💬 ${post.comments}</button>
        <button class="feed-action">🔗 Paylaş</button>
      </div>
    </div>
  `;
}

function toggleLike(btn) {
  btn.classList.toggle('liked');
  const parts = btn.textContent.split(' ');
  const icon = btn.classList.contains('liked') ? '❤️' : '🤍';
  const count = parseInt(parts[1]) + (btn.classList.contains('liked') ? 1 : -1);
  btn.textContent = `${icon} ${count}`;
}

function encodeDataAttr(data) {
  return "'" + JSON.stringify(data).replace(/'/g, "\\'") + "'";
}
