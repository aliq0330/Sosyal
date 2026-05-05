// =============================================
// MAP PAGE — Leaflet map with markers
// =============================================

let leafletMap = null;
let mapTileLayer = null;
let mapTileMode = 0; // 0=dark, 1=light, 2=topo
let mapMarkers = { routes: [], events: [], users: [] };
let mapInitialized = false;
let userMarker = null;

const DEMO_ROUTES = [
  { id:'r1', lat:41.0152, lng:28.9520, title:'Belgrad Ormanı Rotası', km:24.5, difficulty:'medium', vehicle:'bicycle', color:'#22c55e' },
  { id:'r2', lat:41.0600, lng:28.8900, title:'Boğaz Hattı MTB', km:18.2, difficulty:'hard', vehicle:'bicycle', color:'#22c55e' },
  { id:'r3', lat:40.9900, lng:29.0200, title:'Bosphorus Cruise', km:45.0, difficulty:'easy', vehicle:'motorcycle', color:'#22c55e' },
  { id:'r4', lat:41.0400, lng:29.1000, title:'Anadolu Yakası Parkuru', km:31.8, difficulty:'medium', vehicle:'both', color:'#22c55e' },
  { id:'r5', lat:40.9700, lng:28.8500, title:'Şile Yolu Turu', km:62.0, difficulty:'medium', vehicle:'motorcycle', color:'#22c55e' },
];

const DEMO_EVENTS = [
  { id:'e1', lat:41.0200, lng:28.9600, title:'Sabah MTB Turu', date:'2026-05-12', participants:24, vehicle:'bicycle' },
  { id:'e2', lat:41.0500, lng:29.0500, title:'Boğaz Motor Buluşması', date:'2026-05-18', participants:67, vehicle:'motorcycle' },
  { id:'e3', lat:40.9800, lng:28.9000, title:'Hafta Sonu Gravel Ride', date:'2026-05-25', participants:15, vehicle:'bicycle' },
];

const DEMO_USERS = [
  { id:'u1', lat:41.0100, lng:28.9700, username:'ahmet_rides', full_name:'Ahmet K.', vehicle:'bicycle' },
  { id:'u2', lat:41.0350, lng:29.0100, username:'zeynep_moto', full_name:'Zeynep T.', vehicle:'motorcycle' },
  { id:'u3', lat:41.0450, lng:28.9300, username:'can_gravel', full_name:'Can B.', vehicle:'bicycle' },
];

function initMapPage() {
  if (mapInitialized) return;
  setTimeout(() => {
    createLeafletMap();
    mapInitialized = true;
  }, 100);
}

function createLeafletMap() {
  const container = document.getElementById('leaflet-map');
  if (!container || leafletMap) return;

  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const tileUrl = isDark ? MAP_TILES.dark : MAP_TILES.light;

  leafletMap = L.map('leaflet-map', {
    zoomControl: false,
    attributionControl: false,
  }).setView(APP_CONFIG.defaultCoords, APP_CONFIG.defaultZoom);

  mapTileLayer = L.tileLayer(tileUrl, {
    attribution: MAP_TILES.attribution,
    maxZoom: 19,
    subdomains: 'abcd'
  }).addTo(leafletMap);

  // Custom zoom control (top-right)
  L.control.zoom({ position: 'topright' }).addTo(leafletMap);

  // Attribution (hidden initially)
  L.control.attribution({ position: 'bottomright', prefix: false })
    .addAttribution(MAP_TILES.attribution).addTo(leafletMap);

  // Load demo markers
  loadMapMarkers();

  // Try to get user location
  locateUser(false);
}

function updateMapTiles() {
  if (!leafletMap) return;
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const tileUrl = isDark ? MAP_TILES.dark : MAP_TILES.light;
  if (mapTileLayer) leafletMap.removeLayer(mapTileLayer);
  mapTileLayer = L.tileLayer(tileUrl, { maxZoom: 19, subdomains: 'abcd' }).addTo(leafletMap);
}

function cycleMapTile() {
  mapTileMode = (mapTileMode + 1) % 3;
  const tiles = [MAP_TILES.dark, MAP_TILES.light, MAP_TILES.topo];
  const labels = ['🌙', '☀️', '🗻'];
  if (mapTileLayer) leafletMap.removeLayer(mapTileLayer);
  mapTileLayer = L.tileLayer(tiles[mapTileMode], { maxZoom: 19, subdomains: 'abcd' }).addTo(leafletMap);
  document.getElementById('map-tile-btn').textContent = labels[mapTileMode];
}

function loadMapMarkers(filter = 'all') {
  if (!leafletMap) return;

  // Clear existing
  [...mapMarkers.routes, ...mapMarkers.events, ...mapMarkers.users].forEach(m => leafletMap.removeLayer(m));
  mapMarkers = { routes: [], events: [], users: [] };

  const showRoutes = filter === 'all' || filter === 'routes' || filter === 'bicycle' || filter === 'motorcycle';
  const showEvents = filter === 'all' || filter === 'events';
  const showUsers  = filter === 'all' || filter === 'users';

  // Route markers
  if (showRoutes) {
    DEMO_ROUTES.filter(r => filter === 'all' || filter === 'routes' || r.vehicle === filter || r.vehicle === 'both').forEach(route => {
      const icon = L.divIcon({
        className: '',
        html: `<div class="custom-marker" style="width:32px;height:32px;background:#22c55e;color:white;font-size:14px">🟢</div>`,
        iconSize: [32, 32], iconAnchor: [16, 16]
      });
      const marker = L.marker([route.lat, route.lng], { icon })
        .addTo(leafletMap)
        .on('click', () => showMapPopup('route', route));
      mapMarkers.routes.push(marker);
    });
  }

  // Event markers
  if (showEvents) {
    DEMO_EVENTS.forEach(event => {
      const icon = L.divIcon({
        className: '',
        html: `<div class="custom-marker" style="width:32px;height:32px;background:#ef4444;color:white;font-size:14px">🔴</div>`,
        iconSize: [32, 32], iconAnchor: [16, 16]
      });
      const marker = L.marker([event.lat, event.lng], { icon })
        .addTo(leafletMap)
        .on('click', () => showMapPopup('event', event));
      mapMarkers.events.push(marker);
    });
  }

  // User markers
  if (showUsers) {
    DEMO_USERS.forEach(user => {
      const icon = L.divIcon({
        className: '',
        html: `<div class="custom-marker" style="width:32px;height:32px;background:#3b82f6;color:white;font-size:13px;font-weight:700">${avatarInitials(user.full_name)}</div>`,
        iconSize: [32, 32], iconAnchor: [16, 16]
      });
      const marker = L.marker([user.lat, user.lng], { icon })
        .addTo(leafletMap)
        .on('click', () => showMapPopup('user', user));
      mapMarkers.users.push(marker);
    });
  }
}

function showMapPopup(type, data) {
  const popup = document.getElementById('map-popup');
  const content = document.getElementById('map-popup-content');

  let html = '';
  if (type === 'route') {
    html = `
      <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
        <span style="font-size:24px">🟢</span>
        <div style="flex:1">
          <div style="font-size:1rem;font-weight:800;color:var(--text)">${data.title}</div>
          <div style="font-size:0.8125rem;color:var(--text3);margin-top:2px">${vehicleLabel(data.vehicle)}</div>
        </div>
      </div>
      <div class="stat-row" style="margin-bottom:12px">
        <div class="stat-item">📏 <strong>${data.km} km</strong></div>
        <div class="stat-item"><span class="badge difficulty-${data.difficulty}">${difficultyLabel(data.difficulty)}</span></div>
      </div>
      <button class="btn btn-primary btn-full btn-sm" onclick="closeMapPopup();navigate('route-detail', ${JSON.stringify(data).replace(/"/g,'&quot;')})">Detaya Git →</button>
    `;
  } else if (type === 'event') {
    html = `
      <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
        <span style="font-size:24px">🔴</span>
        <div style="flex:1">
          <div style="font-size:1rem;font-weight:800;color:var(--text)">${data.title}</div>
          <div style="font-size:0.8125rem;color:var(--text3);margin-top:2px">${formatDate(data.date)}</div>
        </div>
      </div>
      <div class="stat-row" style="margin-bottom:12px">
        <div class="stat-item">👥 <strong>${data.participants} katılımcı</strong></div>
        <div class="stat-item">🚴 <strong>${vehicleLabel(data.vehicle)}</strong></div>
      </div>
      <button class="btn btn-secondary btn-full btn-sm" onclick="closeMapPopup();navigate('event-detail', ${JSON.stringify(data).replace(/"/g,'&quot;')})">Katıl →</button>
    `;
  } else if (type === 'user') {
    html = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <div class="avatar avatar-md" style="background:var(--primary-dim);color:var(--primary);font-weight:800">${avatarInitials(data.full_name)}</div>
        <div>
          <div style="font-size:1rem;font-weight:800;color:var(--text)">${data.full_name}</div>
          <div style="font-size:0.8125rem;color:var(--text3)">@${data.username}</div>
        </div>
      </div>
      <button class="btn btn-outline btn-full btn-sm" onclick="closeMapPopup();navigate('user-profile', ${JSON.stringify(data).replace(/"/g,'&quot;')})">Profili Gör →</button>
    `;
  }

  content.innerHTML = html;
  popup.classList.add('show');
}

function closeMapPopup() {
  document.getElementById('map-popup').classList.remove('show');
}

function locateUser(fly = true) {
  if (!navigator.geolocation) { showToast('Konum desteklenmiyor', 'error'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude: lat, longitude: lng } = pos.coords;
    if (!leafletMap) return;
    if (userMarker) leafletMap.removeLayer(userMarker);
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:16px;height:16px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.3)"></div>`,
      iconSize: [16, 16], iconAnchor: [8, 8]
    });
    userMarker = L.marker([lat, lng], { icon }).addTo(leafletMap);
    if (fly) leafletMap.flyTo([lat, lng], 14, { duration: 1.5 });
  }, err => {
    if (fly) showToast('Konum alınamadı', 'error');
  });
}

function filterMapLayer(filter, el) {
  document.querySelectorAll('#map-filter-strip .filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  loadMapMarkers(filter);
}

function toggleMapFilter() {
  const strip = document.getElementById('map-filter-strip');
  strip.style.display = strip.style.display === 'none' ? 'flex' : 'none';
  const icon = document.getElementById('filter-icon');
  if (icon) icon.textContent = strip.style.display === 'none' ? '⚙️' : '✕';
}

function mapSearchHandler(q) {
  if (!q.trim()) return;
  // In production: geocode with Nominatim or filter markers
  showToast(`"${q}" aranıyor...`, 'default');
}

// expose for app.js updateMapTiles call
window.leafletMap = null;
Object.defineProperty(window, 'leafletMap', { get: () => leafletMap, set: v => { leafletMap = v; } });
