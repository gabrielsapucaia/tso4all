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