-- =============================================
-- SOSYAL — Trigger Düzeltme (v4 - temiz versiyon)
-- Supabase SQL Editor'a yapistir ve calistir
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_fullname TEXT;
  v_suffix   TEXT;
BEGIN
  v_suffix   := substr(md5(NEW.id::text), 1, 6);
  v_username := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'username'), ''),
    NULLIF(trim(split_part(NEW.email, '@', 1)), ''),
    'user_' || v_suffix
  );
  v_fullname := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(trim(split_part(NEW.email, '@', 1)), ''),
    'Kullanici'
  );

  BEGIN
    INSERT INTO profiles (id, username, full_name)
    VALUES (NEW.id, v_username, v_fullname);
  EXCEPTION
    WHEN unique_violation THEN
      INSERT INTO profiles (id, username, full_name)
      VALUES (NEW.id, v_username || '_' || v_suffix, v_fullname)
      ON CONFLICT (id) DO NOTHING;
    WHEN others THEN
      NULL;
  END;

  RETURN NEW;
EXCEPTION WHEN others THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
