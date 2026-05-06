import { UsersTable } from "@/components/users/users-table"

export default function UsersPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Clientes</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gestioná tu base de clientes, exportá listados y consultá detalles
        </p>
      </div>
      <UsersTable />
    </div>
  )
}
