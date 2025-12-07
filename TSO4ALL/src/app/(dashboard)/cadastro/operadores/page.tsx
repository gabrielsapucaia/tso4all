import { Users } from "lucide-react"

export default function OperadoresPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2">
        <Users className="h-6 w-6" />
        <h2 className="text-3xl font-bold tracking-tight">Operadores</h2>
      </div>
      
      <div className="rounded-lg border bg-card p-6">
        <div className="h-[300px] bg-muted rounded-md flex items-center justify-center">
          <p className="text-muted-foreground">Gestão de operadores em desenvolvimento</p>
        </div>
      </div>
    </div>
  )
}