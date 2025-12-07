-- =====================================================
-- SCRIPT PARA CONFIGURAR ACESSO PÚBLICO (SEM AUTENTICAÇÃO)
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Authenticated users can view all files" ON excellence_files;
DROP POLICY IF EXISTS "Authenticated users can insert files" ON excellence_files;
DROP POLICY IF EXISTS "Authenticated users can update files" ON excellence_files;
DROP POLICY IF EXISTS "Authenticated users can delete files" ON excellence_files;
DROP POLICY IF EXISTS "Public can view all files" ON excellence_files;
DROP POLICY IF EXISTS "Public can insert files" ON excellence_files;
DROP POLICY IF EXISTS "Public can update files" ON excellence_files;
DROP POLICY IF EXISTS "Public can delete files" ON excellence_files;

-- 2. Criar novas políticas públicas para a tabela excellence_files
CREATE POLICY "Public can view all files" ON excellence_files
  FOR SELECT USING (true);

CREATE POLICY "Public can insert files" ON excellence_files
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update files" ON excellence_files
  FOR UPDATE USING (true);

CREATE POLICY "Public can delete files" ON excellence_files
  FOR DELETE USING (true);

-- 3. Remover políticas antigas do storage (se existirem)
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view files" ON storage.objects;
DROP POLICY IF EXISTS "Public can update files" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete files" ON storage.objects;

-- 4. Criar novas políticas públicas para o storage
CREATE POLICY "Public can upload files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'excellence-files');

CREATE POLICY "Public can view files" ON storage.objects
  FOR SELECT USING (bucket_id = 'excellence-files');

CREATE POLICY "Public can update files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'excellence-files');

CREATE POLICY "Public can delete files" ON storage.objects
  FOR DELETE USING (bucket_id = 'excellence-files');

-- 5. Garantir que o bucket existe e é público
INSERT INTO storage.buckets (id, name, public)
VALUES ('excellence-files', 'excellence-files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Pronto! O sistema agora permite acesso público sem autenticação.
