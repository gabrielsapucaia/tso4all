import { getEquipamentos } from '@/services/equipamentos'
import { Wrench, Eye } from 'lucide-react'

export default async function EquipamentosPage() {
  const { data: equipamentos, error } = await getEquipamentos()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
        <p className="text-muted-foreground">
          Lista de equipamentos cadastrados no sistema
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-destructive">Erro ao carregar equipamentos: {error.message}</p>
        </div>
      )}

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                {equipamentos.length > 0 && Object.keys(equipamentos[0]).map((key) => (
                  <th key={key} className="p-3 text-left font-semibold">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {equipamentos.length > 0 ? (
                equipamentos.map((equipamento: any) => (
                  <tr key={equipamento.id} className="border-t hover:bg-accent/50">
                    {Object.values(equipamento).map((value: any, index: number) => (
                      <td key={index} className="p-3">
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={equipamentos.length > 0 ? Object.keys(equipamentos[0]).length : 1} className="p-4 text-center">
                    Nenhum equipamento encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}