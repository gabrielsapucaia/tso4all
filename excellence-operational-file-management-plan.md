# Excelência Operacional - File Management System
## Technical Service Operations (TSO4ALL)

### Overview
Sistema de gestão de arquivos para a seção "Excelência Operacional" com upload, visualização em tabela e sincronização com Supabase Storage.

---

## 1. Database Schema Design

### 1.1 Tabela `excellence_files`

```sql
-- Criar tabela para gestão de arquivos
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

-- Habilitar RLS
ALTER TABLE excellence_files ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view all files" ON excellence_files
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert files" ON excellence_files
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update files" ON excellence_files
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete files" ON excellence_files
  FOR DELETE USING (auth.role() = 'authenticated');

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_excellence_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualização automática
CREATE TRIGGER update_excellence_files_timestamp
  BEFORE UPDATE ON excellence_files
  FOR EACH ROW EXECUTE FUNCTION update_excellence_files_updated_at();
```

### 1.2 Bucket Storage Configuration

```sql
-- Criar bucket para arquivos de Excelência Operacional
INSERT INTO storage.buckets (id, name, public)
VALUES ('excellence-files', 'excellence-files', true);

-- Políticas de acesso ao storage
CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'excellence-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view files" ON storage.objects
  FOR SELECT USING (bucket_id = 'excellence-files');

CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'excellence-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (bucket_id = 'excellence-files' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 2. File Type Icons Mapping

### 2.1 File Extension to Icon Mapping

```typescript
// src/lib/file-types.ts
export const FILE_TYPE_ICONS = {
  // Documents
  pdf: 'FileText', // PDF
  doc: 'FileText', // Word 97-2003
  docx: 'FileText', // Word
  xls: 'Table', // Excel 97-2003
  xlsx: 'Table', // Excel
  ppt: 'Presentation', // PowerPoint 97-2003
  pptx: 'Presentation', // PowerPoint
  
  // Text
  txt: 'FileText',
  rtf: 'FileText',
  odt: 'FileText',
  
  // Images
  jpg: 'Image',
  jpeg: 'Image',
  png: 'Image',
  gif: 'Image',
  svg: 'Image',
  bmp: 'Image',
  webp: 'Image',
  
  // Archives
  zip: 'Archive',
  rar: 'Archive',
  '7z': 'Archive',
  tar: 'Archive',
  gz: 'Archive',
  
  // Code
  js: 'Code',
  ts: 'Code',
  jsx: 'Code',
  tsx: 'Code',
  html: 'Code',
  css: 'Code',
  json: 'Code',
  xml: 'Code',
  
  // Database
  sql: 'Database',
  db: 'Database',
  sqlite: 'Database',
  
  // Video
  mp4: 'Video',
  avi: 'Video',
  mov: 'Video',
  wmv: 'Video',
  flv: 'Video',
  webm: 'Video',
  
  // Audio
  mp3: 'Music',
  wav: 'Music',
  flac: 'Music',
  aac: 'Music',
  ogg: 'Music',
  
  // Default
  default: 'File'
}

export const getFileIcon = (extension: string) => {
  const ext = extension.toLowerCase().replace('.', '')
  return FILE_TYPE_ICONS[ext] || FILE_TYPE_ICONS.default
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
```

---

## 3. Service Layer

### 3.1 File Management Service

```typescript
// src/services/excellence-files.ts
import { supabase } from '@/lib/supabase/client'

export interface ExcellenceFile {
  id: string
  identifier: string
  area: string
  filename: string
  file_path: string
  file_size: number
  file_type: string
  file_extension: string
  uploaded_by: string
  created_at: string
  updated_at: string
}

export interface FileUploadData {
  identifier: string
  area: string
  file: File
}

export class ExcellenceFilesService {
  // Upload arquivo
  static async uploadFile(data: FileUploadData): Promise<ExcellenceFile> {
    const { identifier, area, file } = data
    
    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${identifier}_${Date.now()}.${fileExt}`
    const filePath = `${identifier}/${fileName}`
    
    // Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('excellence-files')
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    // Salvar metadata no banco
    const { data: fileData, error: dbError } = await supabase
      .from('excellence_files')
      .insert({
        identifier,
        area,
        filename: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.type,
        file_extension: fileExt
      })
      .select()
      .single()
    
    if (dbError) throw dbError
    
    return fileData
  }
  
  // Listar arquivos
  static async getFiles(): Promise<ExcellenceFile[]> {
    const { data, error } = await supabase
      .from('excellence_files')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
  
  // Deletar arquivo
  static async deleteFile(id: string): Promise<void> {
    // Buscar arquivo para obter path
    const { data: file, error: fetchError } = await supabase
      .from('excellence_files')
      .select('file_path')
      .eq('id', id)
      .single()
    
    if (fetchError) throw fetchError
    
    // Deletar do storage
    const { error: storageError } = await supabase.storage
      .from('excellence-files')
      .remove([file.file_path])
    
    if (storageError) throw storageError
    
    // Deletar do banco
    const { error: dbError } = await supabase
      .from('excellence_files')
      .delete()
      .eq('id', id)
    
    if (dbError) throw dbError
  }
  
  // Download arquivo
  static async getDownloadUrl(filePath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('excellence-files')
      .createSignedUrl(filePath, 60) // URL válida por 60 segundos
    
    if (error) throw error
    return data.signedUrl
  }
}
```

---

## 4. UI Components

### 4.1 File Upload Component

```typescript
// src/components/excellence/FileUpload.tsx
"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ExcellenceFilesService } from '@/services/excellence-files'

interface FileUploadProps {
  onUploadComplete: () => void
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [identifier, setIdentifier] = useState('')
  const [area, setArea] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/*': ['.txt', '.csv'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg']
    },
    multiple: false
  })

  const handleUpload = async () => {
    if (!identifier || !area || !file) return

    setUploading(true)
    try {
      await ExcellenceFilesService.uploadFile({
        identifier,
        area,
        file
      })
      
      // Reset form
      setIdentifier('')
      setArea('')
      setFile(null)
      onUploadComplete()
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="identifier">Identificador</Label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ex: PROC-001"
              />
            </div>
            <div>
              <Label htmlFor="area">Área</Label>
              <Input
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Ex: Qualidade"
              />
            </div>
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center space-x-2">
                <File className="h-8 w-8 text-blue-500" />
                <span>{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium">
                  {isDragActive ? 'Solte o arquivo aqui' : 'Arraste um arquivo ou clique para selecionar'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Suporta: PDF, DOC, DOCX, XLS, XLSX, TXT, PNG, JPG
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={!identifier || !area || !file || uploading}
            className="w-full"
          >
            {uploading ? 'Enviando...' : 'Enviar Arquivo'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 4.2 Files Table Component

```typescript
// src/components/excellence/FilesTable.tsx
"use client"

import { useState, useEffect } from 'react'
import { Download, Trash2, FileIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExcellenceFilesService, ExcellenceFile } from '@/services/excellence-files'
import { getFileIcon, formatFileSize } from '@/lib/file-types'
import * as LucideIcons from 'lucide-react'

interface FilesTableProps {
  refreshTrigger: number
}

export function FilesTable({ refreshTrigger }: FilesTableProps) {
  const [files, setFiles] = useState<ExcellenceFile[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadFiles()
  }, [refreshTrigger])

  const loadFiles = async () => {
    try {
      const data = await ExcellenceFilesService.getFiles()
      setFiles(data)
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (file: ExcellenceFile) => {
    try {
      const downloadUrl = await ExcellenceFilesService.getDownloadUrl(file.file_path)
      window.open(downloadUrl, '_blank')
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este arquivo?')) return

    setDeleting(id)
    try {
      await ExcellenceFilesService.deleteFile(id)
      setFiles(files.filter(f => f.id !== id))
    } catch (error) {
      console.error('Error deleting file:', error)
    } finally {
      setDeleting(null)
    }
  }

  const getFileIconComponent = (extension: string) => {
    const iconName = getFileIcon(extension) as keyof typeof LucideIcons
    const IconComponent = LucideIcons[iconName] as React.ComponentType<{ className?: string }>
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <FileIcon className="h-5 w-5" />
  }

  if (loading) {
    return <div className="flex justify-center p-8">Carregando arquivos...</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Arquivo</TableHead>
            <TableHead>Identificador</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Tamanho</TableHead>
            <TableHead>Data Upload</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                Nenhum arquivo encontrado
              </TableCell>
            </TableRow>
          ) : (
            files.map((file) => (
              <TableRow key={file.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getFileIconComponent(file.file_extension)}
                    <span className="font-medium">{file.filename}</span>
                  </div>
                </TableCell>
                <TableCell>{file.identifier}</TableCell>
                <TableCell>{file.area}</TableCell>
                <TableCell>{formatFileSize(file.file_size)}</TableCell>
                <TableCell>
                  {new Date(file.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file.id)}
                      disabled={deleting === file.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
```

---

## 5. Main Page Implementation

### 5.1 Excelência Operacional Page

```typescript
// src/app/(dashboard)/cadastro/operadores/page.tsx
"use client"

import { useState } from 'react'
import { FileUpload } from '@/components/excellence/FileUpload'
import { FilesTable } from '@/components/excellence/FilesTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function OperadoresPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Excelência Operacional</h2>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload de Arquivos</TabsTrigger>
          <TabsTrigger value="files">Arquivos Cadastrados</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload de Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload onUploadComplete={handleUploadComplete} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Arquivos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <FilesTable refreshTrigger={refreshTrigger} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

---

## 6. Dependencies Required

### 6.1 Package.json Additions

```json
{
  "dependencies": {
    "react-dropzone": "^14.2.3",
    "@supabase/storage-js": "^2.5.1"
  }
}
```

---

## 7. Implementation Steps

### Phase 1: Database Setup
1. ✅ Execute SQL schema creation
2. ✅ Configure Supabase Storage bucket
3. ✅ Set up RLS policies

### Phase 2: Service Layer
1. ✅ Create file management service
2. ✅ Implement upload/download logic
3. ✅ Add file type detection

### Phase 3: UI Components
1. ✅ Create file upload component
2. ✅ Build files table component
3. ✅ Add responsive design

### Phase 4: Integration
1. ✅ Update Excelência Operacional page
2. ✅ Test file operations
3. ✅ Verify security policies

---

## Security Considerations

- **File Type Validation**: Server-side validation of allowed file types
- **File Size Limits**: Restrict upload size (e.g., 10MB max)
- **Authentication Required**: All operations require authenticated user
- **Path Traversal Prevention**: Secure file naming and path handling
- **Virus Scanning**: Consider integration with virus scanning service

---

## Performance Optimizations

- **Pagination**: Implement pagination for large file lists
- **Lazy Loading**: Load file previews on demand
- **Compression**: Automatic compression for large files
- **CDN**: Use Supabase CDN for fast file delivery

---

## Next Steps

1. Implement database schema
2. Create service layer components
3. Build UI components with drag & drop
4. Test file operations and security
5. Deploy and monitor file usage