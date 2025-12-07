-- Schema SQL para Sistema de Gestão de Arquivos - Excelência Operacional
-- Execute este script no Supabase SQL Editor para configurar o banco de dados

-- 1. Criar tabela para gestão de arquivos
CREATE TABLE excellence_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL, -- Identificador do arquivo
  area TEXT NOT NULL, -- Área responsável
  filename TEXT NOT NULL, -- Nome original do arquivo
  file_path TEXT NOT NULL, -- Caminho no Supabase Storage
  file_size BIGINT NOT NULL, -- Tamanho em bytes
  file_type TEXT NOT NULL, -- Tipo MIME
  file_extension TEXT NOT NULL, -- Extensão (.pdf, .docx, etc.)
  uploaded_by UUID REFERENCES auth.users(id), -- Usuário que fez upload
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE excellence_files ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas de segurança
CREATE POLICY "Authenticated users can view all files" ON excellence_files
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert files" ON excellence_files
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update files" ON excellence_files
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete files" ON excellence_files
  FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_excellence_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger para atualização automática
CREATE TRIGGER update_excellence_files_timestamp
  BEFORE UPDATE ON excellence_files
  FOR EACH ROW EXECUTE FUNCTION update_excellence_files_updated_at();

-- 5. Criar bucket para arquivos de Excelência Operacional
INSERT INTO storage.buckets (id, name, public)
VALUES ('excellence-files', 'excellence-files', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Criar políticas de acesso ao storage
-- Upload de arquivos
CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'excellence-files' AND 
    auth.role() = 'authenticated'
  );

-- Visualização de arquivos
CREATE POLICY "Users can view files" ON storage.objects
  FOR SELECT USING (bucket_id = 'excellence-files');

-- Atualização de arquivos (próprios arquivos)
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'excellence-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Exclusão de arquivos (próprios arquivos)
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'excellence-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 7. Função para validação de domínio (opcional - para usar com Microsoft OAuth)
CREATE OR REPLACE FUNCTION validate_auraminerals_domain()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a tabela auth.users existir e tiver o campo email
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'auth') THEN
    -- Buscar o email do usuário
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.uploaded_by;
    
    -- Verificar se o domínio é @auraminerals.com
    IF user_email IS NOT NULL AND user_email LIKE '%@auraminerals.com' THEN
      RETURN NEW;
    ELSE
      RAISE EXCEPTION 'Apenas usuários com domínio @auraminerals.com podem fazer upload de arquivos';
    END IF;
  ELSE
    -- Se não houver sistema de autenticação configurado, permitir o upload
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger para validação de domínio (opcional)
-- Descomente a linha abaixo se quiser validar domínio @auraminerals.com
-- CREATE TRIGGER validate_domain_trigger
--   BEFORE INSERT ON excellence_files
--   FOR EACH ROW EXECUTE FUNCTION validate_auraminerals_domain();

-- 9. Índices para performance
CREATE INDEX idx_excellence_files_identifier ON excellence_files(identifier);
CREATE INDEX idx_excellence_files_area ON excellence_files(area);
CREATE INDEX idx_excellence_files_created_at ON excellence_files(created_at);

-- 10. Comentários para documentação
COMMENT ON TABLE excellence_files IS 'Tabela para gestão de arquivos da seção Excelência Operacional';
COMMENT ON COLUMN excellence_files.identifier IS 'Identificador único do arquivo (ex: PROC-001)';
COMMENT ON COLUMN excellence_files.area IS 'Área responsável pelo arquivo (ex: Qualidade, Produção)';
COMMENT ON COLUMN excellence_files.file_path IS 'Caminho do arquivo no Supabase Storage';
COMMENT ON COLUMN excellence_files.file_extension IS 'Extensão do arquivo (pdf, docx, xlsx, etc.)';

-- Script concluído!
-- Agora você pode testar o sistema de upload de arquivos.