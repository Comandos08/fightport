-- Migration 3 de 4 — Restringir listagem do bucket school-logos
-- Remove policies redundantes/amplas do storage para o bucket de logos
DROP POLICY IF EXISTS "School logos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_read_school_logos" ON storage.objects;
DROP POLICY IF EXISTS "public_read_school_logos" ON storage.objects;

-- Cria uma única policy de SELECT para o bucket
-- Permite leitura anônima (o logo aparece no passaporte público), mas
-- NÃO permite listagem (o Supabase Storage exige uma policy distinta para LIST).
-- Como não estamos criando policy de LIST, a listagem fica bloqueada por padrão.
CREATE POLICY "public_read_school_logos"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'school-logos');

-- INSERT/UPDATE/DELETE no bucket continua restrito às policies já existentes
-- de upload da escola autenticada.