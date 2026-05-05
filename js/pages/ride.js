// =============================================
// RIDE PAGE — GPS Tracking
// =============================================

let rideState = 'idle'; // idle | active | paused
let rideTimer = null;
let rideSeconds = 0;
let rideWatchId = null;
let rideCoords = [];
let rideDistance = 0;
let rideLastCoord = null;
let rideActiveMap = null;
let ridePolyline = null;
let ridePreviewMap = null;
let rideVehicle = 'bicycle';
let rideCurrentSpeed = 0;
let rideMaxSpeed = 0;
let rideSpeeds = [];
let ridePhotos = [];
let rideStartTime = null;

function initRidePage() {
  if (rideState === 'idle' && !ridePreviewMap) {
    setTimeout(() => {
      const container = document.getElementById('ride-preview-map');
      if (!container || ridePreviewMap) return;
      ridePreviewMap = L.map('ride-preview-map', { zoomControl:false, attributionControl:false, dragging:false, touchZoom:false, scrollWheelZoom:false })
        .setView(APP_CONFIG.defaultCoords, 11);
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      L.tileLayer(isDark ? MAP_TILES.dark : MAP_TILES.light, { maxZoom:19, subdomains:'abcd' }).addTo(ridePreviewMap);
      // Try locate
      navigator.geolocation?.getCurrentPosition(pos => {
        ridePreviewMap.setView([pos.coords.latitude, pos.coords.longitude], 13);
      });
    }, 150);
  }
}

function selectRideVehicle(type, el) {
  rideVehicle = type;
  document.querySelectorAll('#page-ride .btn-card').forEach(b => b.style.background = '');
  el.style.background = 'var(--primary-dim)';
  el.style.borderColor = 'var(--primary)';
  el.style.color = 'var(--primary)';
  const other = type === 'bicycle' ? document.getElementById('veh-motorcycle') : document.getElementById('veh-bicycle');
  if (other) { other.style.background = ''; other.style.borderColor = ''; other.style.color = ''; }
}

function startRide() {
  if (!navigator.geolocation) {
    showToast('Konum servisi gerekli!', 'error');
    return;
  }

  showLoading(true);
  navigator.geolocation.getCurrentPosition(pos => {
    showLoading(false);
    rideState = 'active';
    rideCoords = [[pos.coords.latitude, pos.coords.longitude]];
    rideLastCoord = [pos.coords.latitude, pos.coords.longitude];
    rideDistance = 0;
    rideSeconds = 0;
    rideCurrentSpeed = 0;
    rideMaxSpeed = 0;
    rideSpeeds = [];
    ridePhotos = [];
    rideStartTime = new Date();

    // Show active UI
    document.getElementById('ride-idle').style.display = 'none';
    document.getElementById('ride-active').style.display = 'flex';

    // Init active map
    setTimeout(() => {
      initRideActiveMap(pos.coords.latitude, pos.coords.longitude);
    }, 100);

    // Start timer
    rideTimer = setInterval(updateRideTimer, 1000);

    // Start GPS watch
    rideWatchId = navigator.geolocation.watchPosition(onRidePosition, onRideError, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000
    });

    showToast('Sürüş başladı! 🚴', 'success');
  }, err => {
    showLoading(false);
    // Demo mode — simulate ride
    startDemoRide();
  }, { enableHighAccuracy: true, timeout: 5000 });
}

function startDemoRide() {
  rideState = 'active';
  const startCoord = APP_CONFIG.defaultCoords;
  rideCoords = [startCoord];
  rideLastCoord = startCoord;
  rideDistance = 0; rideSeconds = 0; rideCurrentSpeed = 0; rideSpeeds = []; ridePhotos = [];
  rideStartTime = new Date();

  document.getElementById('ride-idle').style.display = 'none';
  document.getElementById('ride-active').style.display = 'flex';

  setTimeout(() => initRideActiveMap(startCoord[0], startCoord[1]), 100);
  rideTimer = setInterval(updateRideTimer, 1000);

  // Simulate GPS movement
  let step = 0;
  const demoInterval = setInterval(() => {
    if (rideState !== 'active') { clearInterval(demoInterval); return; }
    step++;
    const noise = () => (Math.random() - 0.5) * 0.001;
    const newCoord = [startCoord[0] + step * 0.0008 + noise(), startCoord[1] + step * 0.0005 + noise()];
    const dist = calcDistance(rideLastCoord, newCoord);
    rideDistance += dist;
    rideCoords.push(newCoord);
    rideLastCoord = newCoord;
    rideCurrentSpeed = 12 + Math.random() * 8;
    rideSpeeds.push(rideCurrentSpeed);
    if (rideCurrentSpeed > rideMaxSpeed) rideMaxSpeed = rideCurrentSpeed;
    updateRideStats();
    if (ridePolyline) ridePolyline.setLatLngs(rideCoords);
    if (rideActiveMap) rideActiveMap.panTo(newCoord);
  }, 2000);
  window._demoRideInterval = demoInterval;

  showToast('Demo sürüşü başladı! 🚴 (Simülasyon)', 'default');
}

function initRideActiveMap(lat, lng) {
  const container = document.getElementById('ride-active-map');
  if (!container) return;
  if (rideActiveMap) { rideActiveMap.remove(); rideActiveMap = null; }
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  rideActiveMap = L.map('ride-active-map', { zoomControl:false, attributionControl:false })
    .setView([lat, lng], 15);
  L.tileLayer(isDark ? MAP_TILES.dark : MAP_TILES.light, { maxZoom:19, subdomains:'abcd' }).addTo(rideActiveMap);

  // User position dot
  const icon = L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;background:#f97316;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(249,115,22,0.3)"></div>`,
    iconSize:[14,14], iconAnchor:[7,7]
  });
  L.marker([lat, lng], { icon }).addTo(rideActiveMap);

  // Polyline
  ridePolyline = L.polyline(rideCoords, { color: '#f97316', weight: 4, opacity: 0.9 }).addTo(rideActiveMap);
}

function onRidePosition(pos) {
  if (rideState !== 'active') return;
  const newCoord = [pos.coords.latitude, pos.coords.longitude];
  const dist = rideLastCoord ? calcDistance(rideLastCoord, newCoord) : 0;
  rideDistance += dist;
  rideCoords.push(newCoord);
  rideLastCoord = newCoord;
  rideCurrentSpeed = (pos.coords.speed || 0) * 3.6; // m/s to km/h
  rideSpeeds.push(rideCurrentSpeed);
  if (rideCurrentSpeed > rideMaxSpeed) rideMaxSpeed = rideCurrentSpeed;
  updateRideStats();
  if (ridePolyline) ridePolyline.setLatLngs(rideCoords);
  if (rideActiveMap) rideActiveMap.panTo(newCoord);
}

function onRideError(err) {
  console.warn('GPS error:', err.message);
}

function updateRideTimer() {
  if (rideState !== 'active') return;
  rideSeconds++;
  document.getElementById('active-timer').textContent = formatDurationSeconds(rideSeconds);
}

function updateRideStats() {
  const avgSpeed = rideSpeeds.length > 0 ? rideSpeeds.reduce((a,b)=>a+b,0)/rideSpeeds.length : 0;
  const speedEl = document.getElementById('active-speed');
  const distEl  = document.getElementById('active-distance');
  const avgEl   = document.getElementById('active-avg-speed');
  if (speedEl) speedEl.textContent = rideCurrentSpeed.toFixed(1);
  if (distEl)  distEl.textContent  = rideDistance.toFixed(2);
  if (avgEl)   avgEl.textContent   = avgSpeed.toFixed(1);
}

function togglePause() {
  const btn = document.getElementById('pause-btn');
  if (rideState === 'active') {
    rideState = 'paused';
    clearInterval(rideTimer);
    if (rideWatchId !== null) navigator.geolocation?.clearWatch(rideWatchId);
    btn.textContent = '▶ Devam Et';
    btn.style.color = 'var(--secondary)';
    btn.style.borderColor = 'var(--secondary)';
  } else {
    rideState = 'active';
    rideTimer = setInterval(updateRideTimer, 1000);
    rideWatchId = navigator.geolocation?.watchPosition(onRidePosition, onRideError, { enableHighAccuracy:true });
    btn.textContent = '⏸ Duraklat';
    btn.style.color = '';
    btn.style.borderColor = '';
  }
}

function confirmStopRide() {
  showConfirm({
    icon: '⏹', title: 'Sürüşü Bitir',
    desc: `${rideDistance.toFixed(2)} km tamamlandı. Sürüşü kaydetmek ister misin?`,
    actionLabel: 'Bitir & Kaydet',
    actionClass: 'btn-primary',
    onConfirm: stopRide
  });
}

function stopRide() {
  clearInterval(rideTimer);
  clearInterval(window._demoRideInterval);
  if (rideWatchId !== null) navigator.geolocation?.clearWatch(rideWatchId);
  rideState = 'idle';

  const rideData = {
    coords: rideCoords,
    distance: rideDistance,
    duration: rideSeconds,
    avg_speed: rideSpeeds.length ? rideSpeeds.reduce((a,b)=>a+b,0)/rideSpeeds.length : 0,
    max_speed: rideMaxSpeed,
    vehicle: rideVehicle,
    photos: ridePhotos,
    started_at: rideStartTime?.toISOString(),
    ended_at: new Date().toISOString()
  };

  // Store for share page
  window._lastRideData = rideData;

  // Reset UI
  document.getElementById('ride-idle').style.display = '';
  document.getElementById('ride-active').style.display = 'none';
  if (rideActiveMap) { rideActiveMap.remove(); rideActiveMap = null; }
  document.getElementById('active-timer').textContent = '00:00:00';
  document.getElementById('active-speed').textContent = '0.0';
  document.getElementById('active-distance').textContent = '0.00';
  document.getElementById('active-avg-speed').textContent = '0.0';

  // Navigate to share page
  navigate('share-ride');
}

function addRidePhoto() {
  showToast('Fotoğraf ekleme yakında!', 'default');
}

// ---- Share Ride Page ----
let shareMap = null;

function loadShareRidePage() {
  const data = window._lastRideData;
  const content = document.getElementById('share-ride-content');
  if (!content) return;

  const dist = data ? data.distance.toFixed(2) : '0.00';
  const dur  = data ? Math.round(data.duration / 60) : 0;
  const avg  = data ? data.avg_speed.toFixed(1) : '0.0';

  content.innerHTML = `
    <div class="share-map-preview">
      <div id="share-map"></div>
    </div>
    <div class="share-ride-stats">
      <div class="share-stat"><div class="val">${dist}</div><div class="lbl">KM</div></div>
      <div class="share-stat"><div class="val">${formatDurationSeconds(data?.duration || 0).slice(0,5)}</div><div class="lbl">Süre</div></div>
      <div class="share-stat"><div class="val">${avg}</div><div class="lbl">Ort km/s</div></div>
    </div>
    <div class="share-form">
      <div class="form-group">
        <label class="form-label">Başlık</label>
        <input type="text" class="input" id="share-title" placeholder="Sabah turumu tamamladım 💪" value="Harika bir sürüş!">
      </div>
      <div class="form-group">
        <label class="form-label">Açıklama</label>
        <textarea class="input input-area" id="share-desc" placeholder="Bu sürüş nasıldı? Neler hissettin?"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Zorluk</label>
        <div class="tag-selector" id="share-difficulty">
          <div class="tag-chip" onclick="shareSelectDiff('easy', this)">😌 Kolay</div>
          <div class="tag-chip selected" onclick="shareSelectDiff('medium', this)">💪 Orta</div>
          <div class="tag-chip" onclick="shareSelectDiff('hard', this)">🔥 Zor</div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Yol Tipi</label>
        <div class="tag-selector" id="share-road">
          <div class="tag-chip selected" onclick="shareSelectTag('road', 'asphalt', this)">🛣️ Asfalt</div>
          <div class="tag-chip" onclick="shareSelectTag('road', 'offroad', this)">🌲 Off-road</div>
          <div class="tag-chip" onclick="shareSelectTag('road', 'gravel', this)">🪨 Gravel</div>
          <div class="tag-chip" onclick="shareSelectTag('road', 'mixed', this)">🔀 Karma</div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Topluluğa Paylaş (opsiyonel)</label>
        <select class="select" id="share-community">
          <option value="">Sadece profilimde göster</option>
          <option value="comm1">İstanbul MTB</option>
          <option value="comm2">Boğaz Motor Tutkunları</option>
        </select>
      </div>
      <button class="btn btn-primary btn-full btn-lg" onclick="submitRideShare()">
        🚀 Paylaş
      </button>
      <button class="btn btn-ghost btn-full" onclick="skipShare()" style="margin-top:-4px">
        Paylaşmadan Kaydet
      </button>
    </div>
  `;

  setTimeout(() => {
    const container = document.getElementById('share-map');
    if (!container || shareMap) return;
    const center = data?.coords?.length ? data.coords[0] : APP_CONFIG.defaultCoords;
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    shareMap = L.map('share-map', { zoomControl:false, attributionControl:false, dragging:false })
      .setView(center, 13);
    L.tileLayer(isDark ? MAP_TILES.dark : MAP_TILES.light, { maxZoom:19, subdomains:'abcd' }).addTo(shareMap);
    if (data?.coords?.length > 1) {
      const poly = L.polyline(data.coords, { color:'#f97316', weight:4 }).addTo(shareMap);
      shareMap.fitBounds(poly.getBounds(), { padding:[20,20] });
    }
  }, 200);
}

function shareSelectDiff(val, el) {
  document.querySelectorAll('#share-difficulty .tag-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

function shareSelectTag(group, val, el) {
  document.querySelectorAll(`#share-${group} .tag-chip`).forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

async function submitRideShare() {
  const title = document.getElementById('share-title')?.value.trim() || 'Sürüş';
  const desc  = document.getElementById('share-desc')?.value.trim();
  const data  = window._lastRideData;

  showLoading(true);
  try {
    if (supabaseClient && currentUser && data) {
      const { error } = await supabaseClient.from('rides').insert({
        user_id: currentUser.id,
        title, description: desc,
        distance_km: parseFloat(data.distance.toFixed(2)),
        duration_seconds: data.duration,
        avg_speed: parseFloat(data.avg_speed.toFixed(1)),
        max_speed: parseFloat(data.max_speed.toFixed(1)),
        coordinates: data.coords,
        vehicle_type: data.vehicle,
        is_shared: true,
        started_at: data.started_at,
        ended_at: data.ended_at
      });
      if (error) throw error;
    }
    window._lastRideData = null;
    if (shareMap) { shareMap.remove(); shareMap = null; }
    showToast('Sürüş paylaşıldı! 🎉', 'success');
    navigate('explore');
  } catch(e) {
    showToast(e.message || 'Hata oluştu', 'error');
  } finally {
    showLoading(false);
  }
}

function skipShare() {
  window._lastRideData = null;
  if (shareMap) { shareMap.remove(); shareMap = null; }
  navigate('map');
}
