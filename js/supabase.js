// Supabase client initialization
let supabaseClient = null;

try {
  if (typeof supabase !== 'undefined' && SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    window.supabaseClient = supabaseClient;
    console.log('[Supabase] Client initialized');
  } else {
    console.log('[Supabase] Running in demo mode (configure SUPABASE_URL & SUPABASE_ANON_KEY in config.js)');
  }
} catch (e) {
  console.warn('[Supabase] Init failed, running in demo mode:', e.message);
}

// Helper: get current user
async function getCurrentUser() {
  if (localStorage.getItem('sosyal_demo_mode')) {
    return JSON.parse(localStorage.getItem('sosyal_demo_user') || 'null');
  }
  if (!supabaseClient) return null;
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabaseClient
    .from('profiles').select('*').eq('id', user.id).single();
  return profile;
}

// Helper: check if logged in
async function isLoggedIn() {
  if (localStorage.getItem('sosyal_demo_mode')) return true;
  if (!supabaseClient) return false;
  const { data: { session } } = await supabaseClient.auth.getSession();
  return !!session;
}

// Helper: logout
async function logout() {
  localStorage.removeItem('sosyal_demo_mode');
  localStorage.removeItem('sosyal_demo_user');
  if (supabaseClient) await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}
