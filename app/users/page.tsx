import { UsersTable } from "@/components/users/users-table"

export default function UsersPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Administración de Usuarios</h1>
      <UsersTable />
    </div>
  )
}
