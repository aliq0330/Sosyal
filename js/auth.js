// Authentication handlers

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');

  errEl.classList.add('hidden');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px"></div>';

  try {
    if (!supabaseClient) throw new Error('Supabase yapılandırılmamış. Demo modu kullanın.');
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    window.location.href = 'app.html';
  } catch(err) {
    errEl.textContent = err.message || 'Giriş başarısız. Bilgilerini kontrol et.';
    errEl.classList.remove('hidden');
    btn.disabled = false;
    btn.innerHTML = '<span>Giriş Yap</span>';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const fullName = document.getElementById('reg-fullname').value.trim();
  const username = document.getElementById('reg-username').value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const btn      = document.getElementById('register-btn');
  const errEl    = document.getElementById('register-error');

  if (!fullName) { errEl.textContent = 'Ad Soyad boş olamaz.'; errEl.classList.remove('hidden'); return; }
  if (!username)  { errEl.textContent = 'Kullanıcı adı geçersiz.'; errEl.classList.remove('hidden'); return; }

  errEl.classList.add('hidden');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px"></div>';

  try {
    if (!supabaseClient) throw new Error('Supabase yapılandırılmamış. Demo modu kullanın.');

    // 1) Auth kaydı
    const { data, error } = await supabaseClient.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, username } }
    });
    if (error) throw error;

    const userId = data?.user?.id;

    // 2) Profili manuel oluştur — trigger yedeği.
    //    E-posta doğrulama açıksa session null gelir; upsert'i sessizce geçiyoruz.
    if (userId && data?.session) {
      try {
        await supabaseClient.from('profiles').upsert({
          id:        userId,
          username:  username || email.split('@')[0],
          full_name: fullName || email.split('@')[0],
        }, { onConflict: 'id', ignoreDuplicates: true });
      } catch (_) { /* sessizce geç */ }
    }

    // localStorage'a onboarding verisi için kaydet
    localStorage.setItem('sosyal_pending_profile', JSON.stringify({ username, full_name: fullName }));

    showToast('Kayıt başarılı! Profilini tamamla.', 'success');
    setTimeout(() => showAuthScreen('onboarding'), 800);
  } catch(err) {
    const msgs = {
      'User already registered': 'Bu e-posta zaten kayıtlı.',
      'Database error saving new user': 'Profil oluşturulamadı. Lütfen SQL şemasını Supabase\'e tekrar uygula.',
      'Password should be at least 6 characters': 'Şifre en az 6 karakter olmalı.',
    };
    errEl.textContent = msgs[err.message] || err.message || 'Kayıt başarısız. Tekrar dene.';
    errEl.classList.remove('hidden');
    btn.disabled = false;
    btn.innerHTML = 'Hesap Oluştur';
  }
}

async function saveOnboardingData(data) {
  if (localStorage.getItem('sosyal_demo_mode')) return;
  if (!supabaseClient) return;
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  // Onboarding tamamlandığında profili kesinlikle oluştur/güncelle
  const pending = JSON.parse(localStorage.getItem('sosyal_pending_profile') || '{}');
  await supabaseClient.from('profiles').upsert({
    id:           user.id,
    username:     pending.username  || user.email?.split('@')[0] || 'user',
    full_name:    pending.full_name || user.email?.split('@')[0] || 'Kullanıcı',
    vehicle_type: data.vehicle_type,
    city:         data.city,
  }, { onConflict: 'id' });

  localStorage.removeItem('sosyal_pending_profile');
}

// Toast utility (shared across auth & app)
function showToast(msg, type = 'default') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success: '✅', error: '❌', default: 'ℹ️' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${icons[type] || icons.default}</span><span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; t.style.transition = '0.3s'; setTimeout(() => t.remove(), 300); }, 3000);
}

function showLoading(show) {
  const el = document.getElementById('loading-overlay');
  if (el) el.classList.toggle('hidden', !show);
}
