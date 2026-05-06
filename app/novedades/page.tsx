"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useReleaseNotification } from "@/hooks/utility/useReleaseNotification"
import {
  KauryStar,
  KauryCoupon,
  KauryGift,
  KauryShield,
  KauryBolt,
  KaurySpark,
  KauryHeart,
  KauryMark,
  KauryArrow,
  KauryCheck,
  KauryChart,
} from "@/components/icons"

interface Novedad {
  Icon: React.ComponentType<{ className?: string }>
  badge: string
  title: string
  subtitle: string
  bullets: string[]
  cta?: { label: string; href: string }
  accent: string // gradient class for icon pill
  glow: string // rgba color for halo
}

const NOVEDADES: Novedad[] = [
  {
    Icon: KauryCoupon,
    badge: "Nuevo",
    title: "Cupones de descuento",
    subtitle:
      "Creá códigos promocionales en segundos: por porcentaje o monto fijo, con compra mínima, vencimiento y límites de uso.",
    bullets: [
      "Diferenciá cupones para mayoristas o minoristas",
      "Definí cuántas veces puede usarlos cada cliente",
      "Acumulables o únicos — vos elegís",
    ],
    cta: { label: "Crear mi primer cupón", href: "/cupones" },
    accent: "from-rose-500 to-red-500",
    glow: "rgba(244,63,94,0.25)",
  },
  {
    Icon: KauryGift,
    badge: "Nuevo",
    title: "Regalos automáticos",
    subtitle:
      "Sorprendé a tus clientes incluyendo un regalo en el carrito sin que tengan que hacer nada extra. Ideal para fidelizar y aumentar ticket promedio.",
    bullets: [
      "Configurá un monto mínimo para activarlo",
      "Restringí a clientes con compras recientes",
      "Vence cuando vos quieras, sin tareas manuales",
    ],
    cta: { label: "Configurar mi primer regalo", href: "/regalos" },
    accent: "from-pink-500 to-rose-400",
    glow: "rgba(236,72,153,0.25)",
  },
  {
    Icon: KauryShield,
    badge: "Nuevo",
    title: "Excepción de mínimo por recompra",
    subtitle:
      "Premiá a tus clientes que vuelven: si compraron en los últimos 15 días, no necesitan alcanzar el monto mínimo en su próxima orden.",
    bullets: [
      "Habilitalo con un solo click desde Configuración",
      "Aplicado automáticamente al checkout",
      "Funciona junto a cupones y regalos",
    ],
    cta: { label: "Habilitar la excepción", href: "/settings/common" },
    accent: "from-amber-400 to-orange-500",
    glow: "rgba(245,158,11,0.25)",
  },
  {
    Icon: KauryStar,
    badge: "Renovado",
    title: "Diseño completamente renovado",
    subtitle:
      "Una experiencia visual más clara, rápida y agradable. Pensada para que encuentres lo que buscás sin esfuerzo, en cualquier dispositivo.",
    bullets: [
      "Paleta luminosa con la identidad Kaury",
      "Animaciones suaves y carga instantánea",
      "Sidebar inteligente que se adapta a vos",
    ],
    accent: "from-violet-500 to-fuchsia-500",
    glow: "rgba(168,85,247,0.25)",
  },
]

const STATS = [
  { value: "4", label: "features nuevos" },
  { value: "100%", label: "más rápido" },
  { value: "0", label: "configuración previa" },
]

// =====================================================================
// Confetti CSS-only — al marcar como leído
// =====================================================================
function ConfettiBurst() {
  const pieces = Array.from({ length: 24 })
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const angle = (i / pieces.length) * Math.PI * 2
        const distance = 200 + Math.random() * 120
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance
        const colors = ["#E11D48", "#F43F5E", "#FB7185", "#F59E0B", "#10B981", "#8B5CF6", "#06B6D4"]
        const color = colors[i % colors.length]
        const delay = Math.random() * 0.1
        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-sm"
            style={{
              backgroundColor: color,
              transform: "translate(-50%, -50%)",
              animation: `confetti-fly 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s forwards`,
              ["--cx" as any]: `${x}px`,
              ["--cy" as any]: `${y}px`,
            }}
          />
        )
      })}
      <style>{`
        @keyframes confetti-fly {
          0% { transform: translate(-50%, -50%) scale(0.6); opacity: 1; }
          80% { opacity: 1; }
          100% {
            transform: translate(calc(-50% + var(--cx)), calc(-50% + var(--cy))) scale(0.4) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

// =====================================================================
// Page
// =====================================================================
export default function NovedadesPage() {
  const { seen, hydrated, markSeen } = useReleaseNotification()
  const [showConfetti, setShowConfetti] = useState(false)
  const [justSeen, setJustSeen] = useState(false)

  // Auto mark-as-seen al entrar (después de un beat para que el dot se vea desaparecer)
  useEffect(() => {
    if (hydrated && !seen) {
      const t = setTimeout(() => {
        // Lo dejamos sin auto-marcar para que el botón sea explícito;
        // el dot del header sigue visible hasta que clickee
      }, 50)
      return () => clearTimeout(t)
    }
  }, [hydrated, seen])

  const handleMarkSeen = () => {
    markSeen()
    setShowConfetti(true)
    setJustSeen(true)
    setTimeout(() => setShowConfetti(false), 1400)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative floating brand marks */}
      <KauryMark
        className="hidden md:block absolute top-[6%] left-[8%] h-32 w-32 text-primary/10 animate-float"
        aria-hidden
      />
      <KauryStar
        className="hidden md:block absolute top-[18%] right-[10%] h-24 w-24 text-primary/10 animate-float [animation-delay:1.5s]"
        aria-hidden
      />
      <KaurySpark
        className="hidden md:block absolute top-[55%] right-[6%] h-16 w-16 text-primary/15 animate-pulse-soft"
        aria-hidden
      />
      <KauryHeart
        className="hidden md:block absolute bottom-[12%] left-[6%] h-20 w-20 text-primary/10 animate-float [animation-delay:0.8s]"
        aria-hidden
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* ============== HERO ============== */}
        <header className="text-center space-y-5 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
            <KauryStar className="h-3 w-3" />
            Plataforma 2.0 · Mayo 2026
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.05]">
            Lo nuevo en{" "}
            <span className="text-gradient-brand">Kaury</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground">
            Mejoramos tu backoffice con herramientas que te ayudan a vender más, fidelizar clientes y operar con menos esfuerzo. Acá te contamos todo.
          </p>

          {/* Stats highlight */}
          <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto pt-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border/60 bg-card/60 px-4 py-4 backdrop-blur shadow-soft animate-fade-up"
                style={{ animationDelay: `${100 + i * 80}ms` }}
              >
                <p className="text-2xl sm:text-3xl font-bold text-gradient-brand leading-none">{s.value}</p>
                <p className="mt-1.5 text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wider">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </header>

        {/* ============== Grid de novedades ============== */}
        <section className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-5 stagger">
          {NOVEDADES.map((n) => (
            <article
              key={n.title}
              className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-pop"
            >
              {/* Halo color */}
              <div
                className="absolute -right-12 -top-12 h-44 w-44 rounded-full opacity-50 blur-3xl group-hover:opacity-90 transition-opacity"
                style={{ background: n.glow }}
                aria-hidden
              />

              <div className="relative flex items-start gap-4">
                <div
                  className={
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br " +
                    n.accent +
                    " text-white shadow-pop transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3"
                  }
                >
                  <n.Icon className="h-6 w-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold tracking-tight text-foreground">{n.title}</h2>
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      <KaurySpark className="h-2.5 w-2.5" />
                      {n.badge}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{n.subtitle}</p>

                  <ul className="mt-4 space-y-1.5">
                    {n.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-foreground/90">
                        <KauryCheck className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {n.cta && (
                    <Link href={n.cta.href} className="mt-5 inline-block">
                      <Button variant="soft" size="sm" className="gap-1.5 group/cta">
                        {n.cta.label}
                        <KauryArrow className="h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* ============== CTA Marcar como leído ============== */}
        <section className="mt-16">
          <div className="relative max-w-2xl mx-auto rounded-3xl border border-border/70 bg-gradient-brand-soft p-8 sm:p-10 text-center shadow-soft overflow-hidden">
            {showConfetti && <ConfettiBurst />}

            {!justSeen && !seen ? (
              <>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-pop animate-pulse-soft">
                  <KaurySpark className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  ¿Listo? Sumate a la nueva era
                </h3>
                <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
                  Marcá las novedades como vistas y enfocate en lo que viene. Te avisamos cuando haya cambios nuevos.
                </p>
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleMarkSeen}
                  className="mt-6 gap-2 group"
                >
                  <KauryCheck className="h-4 w-4" />
                  Ya lo revisé, está genial
                </Button>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-pop">
                  <KauryHeart className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">¡Gracias por estar al día!</h3>
                <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
                  Volvemos pronto con más herramientas pensadas para tu operación. Mientras tanto, vendé tranquilo.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <Link href="/cupones">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <KauryCoupon className="h-3.5 w-3.5" />
                      Crear cupón
                    </Button>
                  </Link>
                  <Link href="/regalos">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <KauryGift className="h-3.5 w-3.5" />
                      Configurar regalo
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <KauryArrow className="h-3.5 w-3.5" />
                      Volver al panel
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ============== Footer ============== */}
        <footer className="mt-12 text-center text-xs text-muted-foreground">
          <p>
            ¿Ideas o sugerencias? Tu feedback hace que Kaury crezca.{" "}
            <span className="font-medium text-foreground">Hablá con el equipo</span> cuando quieras.
          </p>
        </footer>
      </div>
    </div>
  )
}
