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
      console.log('🔍 Loading files...')
      const data = await ExcellenceFilesService.getFiles()
      console.log('✅ Files loaded:', data.length)
      setFiles(data)
    } catch (error) {
      console.error('❌ Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (file: ExcellenceFile) => {
    try {
      const url = await ExcellenceFilesService.getDownloadUrl(file.file_path)
      window.open(url, '_blank')
    } catch (error) {
      console.error('❌ Error downloading:', error)
      alert('Erro ao baixar arquivo')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este arquivo?')) return

    setDeleting(id)
    try {
      await ExcellenceFilesService.deleteFile(id)
      setFiles(files.filter(f => f.id !== id))
    } catch (error) {
      console.error('❌ Error deleting:', error)
      alert('Erro ao deletar arquivo')
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