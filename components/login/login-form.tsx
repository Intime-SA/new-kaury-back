"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/providers/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  KauryArrow,
  KauryLoader,
  KauryStar,
  KauryShield,
  KauryBolt,
  KauryAlert,
  KaurySpark,
  KauryMark,
} from "@/components/icons"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await login(email, password)
      router.push("/dashboard")
    } catch (error: any) {
      setError("Credenciales inválidas")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-gradient-aurora" aria-hidden />
      <div
        className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(225,29,72,0.35), transparent 70%)' }}
        aria-hidden
      />
      <div
        className="absolute -bottom-1/4 right-0 h-[500px] w-[500px] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.30), transparent 70%)' }}
        aria-hidden
      />

      {/* Floating brand marks (decorative) */}
      <KauryMark
        className="hidden lg:block absolute top-[12%] right-[8%] h-32 w-32 text-primary/10 animate-float"
        aria-hidden
      />
      <KauryStar
        className="hidden lg:block absolute bottom-[18%] left-[5%] h-20 w-20 text-primary/15 animate-float [animation-delay:1.2s]"
        aria-hidden
      />
      <KaurySpark
        className="hidden lg:block absolute top-[55%] right-[40%] h-12 w-12 text-primary/20 animate-pulse-soft"
        aria-hidden
      />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* Left side – brand showcase */}
        <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-4 animate-fade-up">
            <img src="/kaury_logo_19.svg" alt="Kaury" className="h-14 w-14 select-none" />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mt-1.5">
                Backoffice empresarial
              </p>
            </div>
          </div>

          <div className="space-y-8 animate-fade-up [animation-delay:120ms]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold tracking-wide text-primary backdrop-blur">
                <KauryStar className="h-3 w-3" />
                Plataforma 2.0 — Nueva experiencia
              </span>
              <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-foreground">
                Gestioná tu ecommerce
                <br />
                con <span className="text-gradient-brand">elegancia</span>.
              </h1>
              <p className="mt-4 max-w-md text-base text-muted-foreground">
                Panel unificado para órdenes, productos, clientes y reportes. Todo lo que tu operación
                necesita, en un solo lugar.
              </p>
            </div>

            <div className="grid gap-3 max-w-md stagger">
              {[
                { Icon: KauryBolt, label: "Carga masiva de productos vía Excel" },
                { Icon: KauryShield, label: "Comprobantes y pagos verificados" },
                { Icon: KauryStar, label: "Reportes en tiempo real" },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card/60 px-4 py-3 backdrop-blur transition-all hover:border-primary/30 hover:shadow-soft hover:-translate-y-0.5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand-soft text-primary transition-transform group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground animate-fade-up [animation-delay:300ms]">
            <p>© {new Date().getFullYear()} Kaury — Mayorista de lencería</p>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span className="font-medium">Sistema operativo</span>
            </div>
          </div>
        </div>

        {/* Right side – form */}
        <div className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md animate-fade-up [animation-delay:80ms]">
            {/* Mobile logo */}
            <div className="lg:hidden mb-8 flex items-center gap-3">
              <img src="/kaury_logo_19.svg" alt="Kaury" className="h-12 w-12 select-none" />
              <p className="text-xl font-bold text-foreground">Kaury</p>
            </div>

            <div className="relative rounded-3xl border border-border/70 bg-card/85 p-8 shadow-card backdrop-blur-xl overflow-hidden">
              {/* Subtle inner glow */}
              <div
                className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full opacity-50 blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(225,29,72,0.25), transparent 70%)' }}
                aria-hidden
              />

              <div className="relative mb-7">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Bienvenido de nuevo</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Ingresá tus credenciales para acceder al panel
                </p>
              </div>

              <form onSubmit={handleSubmit} className="relative space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="info@atlantics.dev"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Contraseña
                    </Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 animate-fade-in">
                    <KauryAlert className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full group"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <KauryLoader className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      Iniciar sesión
                      <KauryArrow className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              ¿Problemas para acceder? Contactá al administrador
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
