-- Schema SQL para Sistema de Gestão de Arquivos - Excelência Operacional (ARMAZENAMENTO BLOB)
-- Execute este script no Supabase SQL Editor para configurar o banco de dados
-- Versão com armazenamento direto de arquivos como BLOB no banco de dados

-- 1. Criar tabela para gestão de arquivos (COM file_data BLOB)
CREATE TABLE excellence_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL, -- Identificador do arquivo
  area TEXT NOT NULL, -- Área responsável
  filename TEXT NOT NULL, -- Nome original do arquivo
  file_data BYTEA NOT NULL, -- Conteúdo binário do arquivo (BLOB)
  file_size BIGINT NOT NULL, -- Tamanho em bytes
  file_type TEXT NOT NULL, -- Tipo MIME
  file_extension TEXT NOT NULL, -- Extensão (.pdf, .docx, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_excellence_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger para atualização automática
CREATE TRIGGER update_excellence_files_timestamp
  BEFORE UPDATE ON excellence_files
  FOR EACH ROW EXECUTE FUNCTION update_excellence_files_updated_at();

-- 4. Índices para performance
CREATE INDEX idx_excellence_files_identifier ON excellence_files(identifier);
CREATE INDEX idx_excellence_files_area ON excellence_files(area);
CREATE INDEX idx_excellence_files_created_at ON excellence_files(created_at);

-- 5. Comentários para documentação
COMMENT ON TABLE excellence_files IS 'Tabela para gestão de arquivos da seção Excelência Operacional (armazenamento BLOB)';
COMMENT ON COLUMN excellence_files.identifier IS 'Identificador único do arquivo (ex: PROC-001)';
COMMENT ON COLUMN excellence_files.area IS 'Área responsável pelo arquivo (ex: Qualidade, Produção)';
COMMENT ON COLUMN excellence_files.file_data IS 'Conteúdo binário do arquivo armazenado como BLOB';
COMMENT ON COLUMN excellence_files.file_extension IS 'Extensão do arquivo (pdf, docx, xlsx, etc.)';

-- Script concluído!
-- Agora você pode testar o sistema de upload de arquivos com armazenamento BLOB.