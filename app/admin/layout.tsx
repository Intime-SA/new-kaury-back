import { ProtectedRoute } from '@/providers/auth-context'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
