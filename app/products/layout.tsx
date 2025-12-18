import { ProtectedRoute } from "@/providers/auth-context"

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute><div className="h-full bg-background text-foreground">{children}</div></ProtectedRoute>
}