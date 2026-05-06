import { ProtectedRoute } from "@/providers/auth-context"

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}