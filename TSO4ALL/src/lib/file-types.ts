import * as LucideIcons from 'lucide-react'

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
  return FILE_TYPE_ICONS[ext as keyof typeof FILE_TYPE_ICONS] || FILE_TYPE_ICONS.default
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}