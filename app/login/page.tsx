"use client"

import { useAuth } from "@/providers/auth-context"
import { LoginForm } from "@/components/login/login-form"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
        <div className="absolute inset-0 bg-gradient-aurora" aria-hidden />
        <div className="relative h-16 w-16 rounded-2xl bg-gradient-brand p-[3px] shadow-pop animate-pulse-soft">
          <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-card">
            <div className="h-8 w-8 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return <LoginForm />
}
