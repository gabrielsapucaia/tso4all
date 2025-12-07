"use client"

import { useState } from 'react'
import { FilesTable } from '@/components/excellence/FilesTable'
import { AddFileButton } from '@/components/excellence/AddFileButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award } from 'lucide-react'

export default function ExcelenciaPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <Award className="h-6 w-6" />
          <h2 className="text-3xl font-bold tracking-tight">Excelência Operacional</h2>
        </div>
        
        <AddFileButton onSuccess={handleUploadSuccess} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arquivos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <FilesTable refreshTrigger={refreshTrigger} />
        </CardContent>
      </Card>
    </div>
  )
}