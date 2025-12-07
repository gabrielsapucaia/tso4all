"use client"

import { useState, useRef } from 'react'
import { Upload, X, FileUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ExcellenceFilesService } from '@/services/excellence-files'

interface AddFileButtonProps {
  onSuccess: () => void
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif'
]

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export function AddFileButton({ onSuccess }: AddFileButtonProps) {
  const [open, setOpen] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [area, setArea] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setIdentifier('')
    setArea('')
    setFile(null)
    setError('')
    setDragOver(false)
  }

  const handleClose = () => {
    if (!loading) {
      setOpen(false)
      resetForm()
    }
  }

  const validateFile = (f: File): string | null => {
    if (f.size > MAX_SIZE) {
      return `Arquivo muito grande. Máximo: 10MB (atual: ${(f.size / 1024 / 1024).toFixed(2)}MB)`
    }
    if (!ALLOWED_TYPES.includes(f.type) && f.type !== '') {
      return 'Tipo de arquivo não permitido. Use: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV, PNG, JPG, GIF'
    }
    return null
  }

  const handleFileSelect = (f: File) => {
    const validationError = validateFile(f)
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFileSelect(f)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFileSelect(f)
  }

  const handleSubmit = async () => {
    if (!identifier.trim()) {
      setError('Preencha o identificador')
      return
    }
    if (!area.trim()) {
      setError('Preencha a área')
      return
    }
    if (!file) {
      setError('Selecione um arquivo')
      return
    }

    setLoading(true)
    setError('')

    try {
      await ExcellenceFilesService.uploadFile({
        identifier: identifier.trim(),
        area: area.trim(),
        file
      })
      
      handleClose()
      onSuccess()
    } catch (err) {
      console.error('Erro no upload:', err)
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(`Falha no upload: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <FileUp className="h-4 w-4" />
        Adicionar Arquivo
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Arquivo</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Identificador */}
            <div className="space-y-2">
              <Label htmlFor="identifier">Identificador *</Label>
              <Input
                id="identifier"
                placeholder="Ex: PROC-001"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Área */}
            <div className="space-y-2">
              <Label htmlFor="area">Área *</Label>
              <Input
                id="area"
                placeholder="Ex: Qualidade"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Área de upload */}
            <div className="space-y-2">
              <Label>Arquivo *</Label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => inputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                  transition-colors duration-200
                  ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                  ${file ? 'bg-green-50 border-green-300' : ''}
                `}
              >
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  onChange={handleInputChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.png,.jpg,.jpeg,.gif"
                  disabled={loading}
                />
                
                {file ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <Upload className="h-5 w-5" />
                      <span className="font-medium">{file.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFile(null)
                        }}
                        className="p-1 hover:bg-green-200 rounded"
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Arraste um arquivo ou clique para selecionar
                    </p>
                    <p className="text-xs text-gray-400">
                      PDF, DOC, DOCX, XLS, XLSX, TXT, CSV, PNG, JPG (máx. 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
