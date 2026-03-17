import { ProtectedRoute } from '@/providers/auth-context'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="h-full bg-background text-foreground">{children}</div>
    </ProtectedRoute>
  )
}
