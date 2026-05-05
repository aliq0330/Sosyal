// =============================================
// MESSAGES PAGE & CHAT
// =============================================

const DEMO_CONVERSATIONS = [
  { id:'conv1', user:{ full_name:'Ahmet Kaya', username:'ahmet_k' }, last_message:'Pazar günü sürüşe geliyor musun?', last_message_at:'2026-05-05T09:30:00Z', unread:2 },
  { id:'conv2', user:{ full_name:'Zeynep Taşkın', username:'zeynep_t' }, last_message:'O rotayı geçen hafta denedim, harika!', last_message_at:'2026-05-04T18:00:00Z', unread:0 },
  { id:'conv3', user:{ full_name:'İstanbul MTB', username:'istanbul_mtb', isGroup:true }, last_message:'Yarın sabah 07:00\'de buluşuyoruz!', last_message_at:'2026-05-04T20:00:00Z', unread:5 },
  { id:'conv4', user:{ full_name:'Mert Yıldız', username:'mert_y' }, last_message:'Rotanın GPX dosyasını paylaşabilir misin?', last_message_at:'2026-05-03T15:00:00Z', unread:0 },
  { id:'conv5', user:{ full_name:'Enduro TR Grubu', username:'enduro_tr', isGroup:true }, last_message:'Uludağ etkinliği için kayıtlar açıldı', last_message_at:'2026-05-02T11:00:00Z', unread:0 },
];

const DEMO_MESSAGES = {
  conv1: [
    { id:'m1', sender:{ full_name:'Ahmet Kaya' }, content:'Merhaba! Nasılsın?', created_at:'2026-05-05T09:00:00Z', isOwn:false },
    { id:'m2', isOwn:true, content:'İyiyim, teşekkürler! Sen nasılsın?', created_at:'2026-05-05T09:05:00Z' },
    { id:'m3', sender:{ full_name:'Ahmet Kaya' }, content:'Gayet iyi! Pazar günü Belgrad Ormanı\'nda sürüş planlıyoruz, geliyor musun?', created_at:'2026-05-05T09:20:00Z', isOwn:false },
    { id:'m4', sender:{ full_name:'Ahmet Kaya' }, content:'Saat 07:00\'de başlıyoruz, yaklaşık 25 km olacak.', created_at:'2026-05-05T09:21:00Z', isOwn:false },
    { id:'m5', isOwn:true, content:'Kulağa harika geliyor! Evet gelirim 💪', created_at:'2026-05-05T09:25:00Z' },
    { id:'m6', sender:{ full_name:'Ahmet Kaya' }, content:'Pazar günü sürüşe geliyor musun?', created_at:'2026-05-05T09:30:00Z', isOwn:false },
  ],
  conv2: [
    { id:'m1', sender:{ full_name:'Zeynep Taşkın' }, content:'Merhaba! Belgrad rotanı takip ettim, çok güzel görünüyor!', created_at:'2026-05-04T17:30:00Z', isOwn:false },
    { id:'m2', isOwn:true, content:'Teşekkürler! Senin için uygun olur, zorluk seviyesi orta.', created_at:'2026-05-04T17:45:00Z' },
    { id:'m3', sender:{ full_name:'Zeynep Taşkın' }, content:'O rotayı geçen hafta denedim, harika!', created_at:'2026-05-04T18:00:00Z', isOwn:false },
  ],
};

function loadMessagesPage() {
  const content = document.getElementById('messages-list-content');
  if (!content) return;

  if (DEMO_CONVERSATIONS.length === 0) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">💬</div><h3 class="empty-title">Henüz mesaj yok</h3><p class="empty-desc">Kullanıcı profillerinden mesaj gönderebilirsin.</p></div>`;
    return;
  }

  content.innerHTML = DEMO_CONVERSATIONS.map(conv => `
    <div class="conversation-item" onclick="openChat(${encodeDataAttr(conv)})">
      <div class="avatar avatar-md" style="background:var(--primary-dim);color:var(--primary);font-weight:800;flex-shrink:0">
        ${conv.user.isGroup ? '👥' : avatarInitials(conv.user.full_name)}
      </div>
      <div class="conversation-info">
        <div class="conversation-name">${conv.user.full_name}</div>
        <div class="conversation-last">${conv.last_message}</div>
      </div>
      <div class="conversation-meta">
        <span class="conversation-time">${formatTimeAgo(conv.last_message_at)}</span>
        ${conv.unread > 0 ? `<span class="conversation-unread">${conv.unread}</span>` : ''}
      </div>
    </div>
  `).join('');
}

function openChat(data) {
  if (!data) return;
  // Update header
  const nameEl = document.getElementById('chat-header-name');
  const avatarEl = document.getElementById('chat-header-avatar');
  if (nameEl) nameEl.textContent = data.user?.full_name || data.full_name || 'Mesaj';
  if (avatarEl) {
    const name = data.user?.full_name || data.full_name || '?';
    avatarEl.style.background = 'var(--primary-dim)';
    avatarEl.style.color = 'var(--primary)';
    avatarEl.style.fontWeight = '800';
    avatarEl.textContent = data.user?.isGroup ? '👥' : avatarInitials(name);
  }

  // Load messages
  const messagesEl = document.getElementById('chat-messages');
  if (!messagesEl) return;
  const convId = data.id || 'conv1';
  const msgs = DEMO_MESSAGES[convId] || DEMO_MESSAGES.conv1;

  messagesEl.innerHTML = msgs.map(m => renderMessage(m)).join('');
  messagesEl.scrollTop = messagesEl.scrollHeight;

  // Store current chat
  window._currentChat = { id: convId, user: data.user || data };
}

function renderMessage(m) {
  const isOwn = m.isOwn;
  return `
    <div class="message-bubble ${isOwn ? 'own' : 'other'}">
      <div class="bubble-text">${m.content}</div>
      <div class="bubble-time">${formatTimeAgo(m.created_at)}</div>
    </div>
  `;
}

function chatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
}

function sendChatMessage() {
  const input = document.getElementById('chat-input-text');
  const text = input?.value.trim();
  if (!text) return;

  const messagesEl = document.getElementById('chat-messages');
  if (!messagesEl) return;

  const msg = {
    isOwn: true,
    content: text,
    created_at: new Date().toISOString()
  };
  messagesEl.insertAdjacentHTML('beforeend', renderMessage(msg));
  messagesEl.scrollTop = messagesEl.scrollHeight;

  input.value = '';
  input.style.height = 'auto';

  // Simulate reply after 1-2 seconds
  if (window._currentChat) {
    setTimeout(() => {
      const replies = [
        'Harika! 👍',
        'Tamam, görüşürüz!',
        'Anlıyorum, teşekkürler.',
        'Evet, katılıyorum!',
        '💪💪💪',
        'Harika bir fikir!',
      ];
      const reply = {
        isOwn: false,
        sender: { full_name: window._currentChat.user?.full_name || 'Kullanıcı' },
        content: replies[Math.floor(Math.random() * replies.length)],
        created_at: new Date().toISOString()
      };
      messagesEl.insertAdjacentHTML('beforeend', renderMessage(reply));
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 1000 + Math.random() * 1000);
  }

  // Save to Supabase if available
  if (supabaseClient && currentUser && window._currentChat?.id) {
    supabaseClient.from('messages').insert({
      conversation_id: window._currentChat.id,
      sender_id: currentUser.id,
      content: text
    }).catch(console.warn);
  }
}

function newMessage() {
  openBottomSheet(`
    <h3 style="font-size:1.125rem;font-weight:800;margin-bottom:16px">Yeni Mesaj ✉️</h3>
    <div class="form-group" style="margin-bottom:16px">
      <label class="form-label">Kullanıcı Ara</label>
      <div class="input-icon">
        <span class="icon">🔍</span>
        <input type="text" class="input" placeholder="Kullanıcı adı...">
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:0">
      ${DEMO_CONVERSATIONS.map(c => `
        <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="closeBottomSheet();openChat(${encodeDataAttr(c)});navigate('chat', ${encodeDataAttr(c)})">
          <div class="avatar avatar-md" style="background:var(--primary-dim);color:var(--primary);font-weight:800">${c.user.isGroup ? '👥' : avatarInitials(c.user.full_name)}</div>
          <div>
            <div style="font-weight:700">${c.user.full_name}</div>
            <div style="font-size:0.8125rem;color:var(--text3)">@${c.user.username}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `);
}
