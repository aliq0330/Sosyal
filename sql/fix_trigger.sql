-- =============================================
-- SOSYAL — Sadece trigger'ı güncelle
-- Tüm şemayı baştan çalıştırmak istemiyorsan
-- sadece bu dosyayı SQL Editor'a yapıştır.
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_fullname TEXT;
BEGIN
  v_username := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
    NULLIF(TRIM(split_part(NEW.email, '@', 1)), ''),
    'user_' || LEFT(REPLACE(NEW.id::TEXT, '-', ''), 8)
  );
  v_fullname := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(split_part(NEW.email, '@', 1)), ''),
    'Kullanıcı'
  );

  BEGIN
    INSERT INTO profiles (id, username, full_name)
    VALUES (NEW.id, v_username, v_fullname);
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO profiles (id, username, full_name)
    VALUES (
      NEW.id,
      v_username || '_' || LEFT(REPLACE(NEW.id::TEXT, '-', ''), 6),
      v_fullname
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı yeniden bağla
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
