-- =============================================
-- SOSYAL - Cycling & Motorcycle Community App
-- Supabase PostgreSQL Schema v2 (fixed ordering)
-- =============================================
-- ADIM 1: Extension
-- ADIM 2: Tüm tablolar (politika yok)
-- ADIM 3: RLS aktifleştirme + politikalar
-- ADIM 4: Fonksiyonlar ve trigger'lar
-- ADIM 5: Index'ler
-- ADIM 6: Seed data
-- =============================================

-- =============================================
-- ADIM 1: EXTENSIONS
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ADIM 2: TABLOLAR
-- =============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  vehicle_type TEXT CHECK (vehicle_type IN ('bicycle', 'motorcycle', 'both')) DEFAULT 'bicycle',
  total_km DECIMAL(10,2) DEFAULT 0,
  total_rides INT DEFAULT 0,
  follower_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS routes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  distance_km DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_minutes INT DEFAULT 0,
  elevation_gain INT DEFAULT 0,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  road_type TEXT CHECK (road_type IN ('asphalt', 'off-road', 'mixed', 'gravel')) DEFAULT 'asphalt',
  vehicle_type TEXT CHECK (vehicle_type IN ('bicycle', 'motorcycle', 'both')) DEFAULT 'both',
  coordinates JSONB NOT NULL DEFAULT '[]',
  start_point JSONB,
  end_point JSONB,
  cover_photo_url TEXT,
  photos JSONB DEFAULT '[]',
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  save_count INT DEFAULT 0,
  city TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  title TEXT,
  description TEXT,
  distance_km DECIMAL(10,2) DEFAULT 0,
  duration_seconds INT DEFAULT 0,
  avg_speed DECIMAL(5,2) DEFAULT 0,
  max_speed DECIMAL(5,2) DEFAULT 0,
  elevation_gain INT DEFAULT 0,
  calories INT DEFAULT 0,
  coordinates JSONB DEFAULT '[]',
  photos JSONB DEFAULT '[]',
  vehicle_type TEXT CHECK (vehicle_type IN ('bicycle', 'motorcycle')) DEFAULT 'bicycle',
  is_shared BOOLEAN DEFAULT false,
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS communities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_photo_url TEXT,
  avatar_url TEXT,
  vehicle_type TEXT CHECK (vehicle_type IN ('bicycle', 'motorcycle', 'both', 'mtb', 'road', 'enduro')) DEFAULT 'both',
  city TEXT,
  member_count INT DEFAULT 0,
  post_count INT DEFAULT 0,
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bu tablo communities'den SONRA gelmeli (foreign key nedeniyle)
CREATE TABLE IF NOT EXISTS community_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  cover_photo_url TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  location_name TEXT,
  start_coordinates JSONB,
  max_participants INT,
  participant_count INT DEFAULT 0,
  vehicle_type TEXT CHECK (vehicle_type IN ('bicycle', 'motorcycle', 'both')) DEFAULT 'both',
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  city TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  content TEXT,
  photos JSONB DEFAULT '[]',
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('ride_share', 'route_share', 'text', 'event', 'photo')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE TABLE IF NOT EXISTS saved_routes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, route_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('follow', 'like', 'comment', 'event_invite', 'community_invite', 'ride_mention', 'event_reminder')),
  reference_id UUID,
  reference_type TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  is_group BOOLEAN DEFAULT false,
  group_name TEXT,
  group_avatar_url TEXT,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  unread_count INT DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'route', 'location', 'ride')),
  attachment_url TEXT,
  attachment_data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  color TEXT DEFAULT '#f97316',
  condition_type TEXT CHECK (condition_type IN ('km_total', 'rides_count', 'communities_joined', 'routes_shared', 'followers', 'events_attended')),
  condition_value INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- =============================================
-- ADIM 3: RLS & POLİTİKALAR
-- (Tüm tablolar artık mevcut, sıra önemli değil)
-- =============================================

ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities           ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE events                ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants    ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows               ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_routes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges           ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- routes
CREATE POLICY "routes_select" ON routes FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "routes_insert" ON routes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "routes_update" ON routes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "routes_delete" ON routes FOR DELETE USING (auth.uid() = user_id);

-- rides
CREATE POLICY "rides_select" ON rides FOR SELECT USING (is_shared = true OR auth.uid() = user_id);
CREATE POLICY "rides_insert" ON rides FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rides_update" ON rides FOR UPDATE USING (auth.uid() = user_id);

-- communities (community_members artık mevcut!)
CREATE POLICY "communities_select" ON communities FOR SELECT USING (
  is_private = false OR EXISTS(
    SELECT 1 FROM community_members
    WHERE community_id = communities.id AND user_id = auth.uid()
  )
);
CREATE POLICY "communities_insert" ON communities FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "communities_update" ON communities FOR UPDATE USING (auth.uid() = created_by);

-- community_members
CREATE POLICY "comm_members_select" ON community_members FOR SELECT USING (true);
CREATE POLICY "comm_members_insert" ON community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comm_members_delete" ON community_members FOR DELETE USING (auth.uid() = user_id);

-- events
CREATE POLICY "events_select" ON events FOR SELECT USING (is_public = true OR auth.uid() = organizer_id);
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "events_update" ON events FOR UPDATE USING (auth.uid() = organizer_id);

-- event_participants
CREATE POLICY "event_parts_select" ON event_participants FOR SELECT USING (true);
CREATE POLICY "event_parts_insert" ON event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "event_parts_update" ON event_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "event_parts_delete" ON event_participants FOR DELETE USING (auth.uid() = user_id);

-- posts
CREATE POLICY "posts_select" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid() = user_id);

-- likes
CREATE POLICY "likes_select" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON likes FOR DELETE USING (auth.uid() = user_id);

-- comments
CREATE POLICY "comments_select" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (auth.uid() = user_id);

-- follows
CREATE POLICY "follows_select" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- saved_routes
CREATE POLICY "saved_select" ON saved_routes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_insert" ON saved_routes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_delete" ON saved_routes FOR DELETE USING (auth.uid() = user_id);

-- notifications
CREATE POLICY "notif_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notif_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- conversations
CREATE POLICY "conv_select" ON conversations FOR SELECT USING (
  EXISTS(SELECT 1 FROM conversation_participants WHERE conversation_id = conversations.id AND user_id = auth.uid())
);

-- conversation_participants
CREATE POLICY "conv_parts_select" ON conversation_participants FOR SELECT USING (
  EXISTS(SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = conversation_participants.conversation_id AND cp.user_id = auth.uid())
);
CREATE POLICY "conv_parts_insert" ON conversation_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

-- messages
CREATE POLICY "msg_select" ON messages FOR SELECT USING (
  EXISTS(SELECT 1 FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);
CREATE POLICY "msg_insert" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS(SELECT 1 FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);

-- user_badges
CREATE POLICY "badges_select" ON user_badges FOR SELECT USING (true);

-- =============================================
-- ADIM 4: FONKSİYONLAR & TRIGGER'LAR
-- =============================================

-- Yeni kullanıcı kaydolunca profil oluştur
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Takip sayılarını güncelle
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET follower_count  = follower_count  + 1 WHERE id = NEW.following_id;
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    INSERT INTO notifications (user_id, from_user_id, type, reference_id, reference_type, message)
    VALUES (NEW.following_id, NEW.follower_id, 'follow', NEW.follower_id, 'profile', 'seni takip etmeye başladı');
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET follower_count  = GREATEST(0, follower_count  - 1) WHERE id = OLD.following_id;
    UPDATE profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_follow_change ON follows;
CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Topluluk üye sayısını güncelle
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities SET member_count = member_count + 1 WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.community_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_community_member_change ON community_members;
CREATE TRIGGER on_community_member_change
  AFTER INSERT OR DELETE ON community_members
  FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

-- Etkinlik katılımcı sayısını güncelle
CREATE OR REPLACE FUNCTION update_event_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'going' THEN
    UPDATE events SET participant_count = participant_count + 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'going' THEN
    UPDATE events SET participant_count = GREATEST(0, participant_count - 1) WHERE id = OLD.event_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_event_participant_change ON event_participants;
CREATE TRIGGER on_event_participant_change
  AFTER INSERT OR DELETE ON event_participants
  FOR EACH ROW EXECUTE FUNCTION update_event_participant_count();

-- Sürüş tamamlanınca profil istatistiklerini güncelle
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET
    total_km    = total_km    + COALESCE(NEW.distance_km, 0),
    total_rides = total_rides + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_ride_complete ON rides;
CREATE TRIGGER on_ride_complete
  AFTER INSERT ON rides
  FOR EACH ROW EXECUTE FUNCTION update_profile_stats();

-- =============================================
-- ADIM 5: INDEX'LER
-- =============================================

CREATE INDEX IF NOT EXISTS idx_routes_user_id      ON routes(user_id);
CREATE INDEX IF NOT EXISTS idx_routes_city          ON routes(city);
CREATE INDEX IF NOT EXISTS idx_routes_vehicle_type  ON routes(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_routes_difficulty    ON routes(difficulty);
CREATE INDEX IF NOT EXISTS idx_routes_created_at    ON routes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rides_user_id        ON rides(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id        ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_community_id   ON posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at     ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_city          ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_start         ON events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_community     ON events(community_id);
CREATE INDEX IF NOT EXISTS idx_notif_user_id        ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_is_read        ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_conv_id     ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at  ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_follower     ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following    ON follows(following_id);

-- =============================================
-- ADIM 6: SEED DATA — Rozetler
-- =============================================

INSERT INTO badges (name, description, icon, color, condition_type, condition_value) VALUES
  ('İlk Sürüş',       'İlk sürüşünü tamamladın!',       '🚴', '#22c55e', 'rides_count',        1),
  ('50 KM Kulübü',    '50 km tamamladın',                '⭐', '#f97316', 'km_total',            50),
  ('100 KM Kulübü',   '100 km efsanesi',                 '🏆', '#eab308', 'km_total',           100),
  ('500 KM Veteran',  '500 km tamamladın',               '💎', '#3b82f6', 'km_total',           500),
  ('1000 KM Efsane',  'Bin km kulübü',                   '👑', '#8b5cf6', 'km_total',          1000),
  ('Sosyal Kelebek',  '10 takipçiye ulaştın',            '🦋', '#ec4899', 'followers',           10),
  ('Topluluk Lideri', '3 topluluğa katıldın',            '🤝', '#14b8a6', 'communities_joined',   3),
  ('Rota Paylaşımcı', '5 rota paylaştın',                '🗺️', '#f97316', 'routes_shared',        5),
  ('Etkinlik Kurdu',  '5 etkinliğe katıldın',            '🎉', '#ef4444', 'events_attended',      5),
  ('10 Sürüş',        'On sürüş tamamladın',             '🔥', '#f97316', 'rides_count',         10)
ON CONFLICT DO NOTHING;
