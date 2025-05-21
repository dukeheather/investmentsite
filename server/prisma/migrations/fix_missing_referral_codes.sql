-- For all users with a NULL referralCode, generate a random code and set it
DO $$
DECLARE
  r RECORD;
  new_code TEXT;
BEGIN
  FOR r IN SELECT id FROM "User" WHERE "referralCode" IS NULL OR "referralCode" = '' LOOP
    LOOP
      new_code := 'REF_' || substr(md5(random()::text), 1, 8);
      EXIT WHEN NOT EXISTS (SELECT 1 FROM "User" WHERE "referralCode" = new_code);
    END LOOP;
    UPDATE "User" SET "referralCode" = new_code WHERE id = r.id;
  END LOOP;
END $$; 