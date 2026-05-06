/**
 * Kaury Icon System
 *
 * Set propio de iconos custom para reemplazar los lucide genéricos en
 * superficies de marca (login, header, KPIs, etc).
 *
 * Cada icono:
 *  - viewBox 0 0 24 24 (drop-in con lucide)
 *  - Acepta className, props HTML estándar de svg
 *  - Usa currentColor + opacity para duotone (fill + stroke)
 *  - stroke-width 1.5 con linecap/linejoin round (línea suave, premium)
 */

import * as React from "react"

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number | string }

const baseProps = (size: number | string = 24) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  xmlns: "http://www.w3.org/2000/svg",
})

/* =============================================================
   Brand mark — diamante / chispa Kaury
   ============================================================= */
export const KauryMark = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size, className, ...props }, ref) => (
    <svg ref={ref} {...baseProps(size)} className={className} {...props}>
      <path d="M12 3.5 21 12l-9 8.5L3 12z" fill="currentColor" fillOpacity="0.12" />
      <path d="M12 3.5 21 12l-9 8.5L3 12z" />
      <path d="M7.5 12 12 7.5l4.5 4.5L12 16.5z" fill="currentColor" fillOpacity="0.4" stroke="none" />
    </svg>
  ),
)
KauryMark.displayName = "KauryMark"

/* =============================================================
   Spark — chispa de 4 puntas con halo (premium / novedad)
   ============================================================= */
export const KaurySpark = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size, className, ...props }, ref) => (
    <svg ref={ref} {...baseProps(size)} className={className} {...props}>
      <path
        d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21M5.6 5.6l2.3 2.3M16.1 16.1l2.3 2.3M5.6 18.4l2.3-2.3M16.1 7.9l2.3-2.3"
      />
      <circle cx="12" cy="12" r="3.2" fill="currentColor" fillOpacity="0.15" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  ),
)
KaurySpark.displayName = "KaurySpark"

/* =============================================================
   Bolt — rayo con brillo
   (reemplaza Zap)
   ============================================================= */
export const KauryBolt = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size, className, ...props }, ref) => (
    <svg ref={ref} {...baseProps(size)} className={className} {...props}>
      <path
        d="M13 2 4 13.5h6L11 22l9-11.5h-6z"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path d="M13 2 4 13.5h6L11 22l9-11.5h-6z" />
      <path d="M16.5 5.5 19 4M19.5 8.5 21 7" strokeWidth="1.4" />
    </svg>
  ),
)
KauryBolt.displayName = "KauryBolt"

/* =============================================================
   Shield — escudo redondeado con check interno
   (reemplaza ShieldCheck)
   ============================================================= */
export const KauryShield = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size, className, ...props }, ref) => (
    <svg ref={ref} {...baseProps(size)} className={className} {...props}>
      <path
        d="M12 3 4.5 5.5v6.2c0 4.5 3.2 7.6 7.5 9.3 4.3-1.7 7.5-4.8 7.5-9.3V5.5z"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path d="M12 3 4.5 5.5v6.2c0 4.5 3.2 7.6 7.5 9.3 4.3-1.7 7.5-4.8 7.5-9.3V5.5z" />
      <path d="M9 12.2 11 14.2 15 10.2" strokeWidth="1.8" />
    </svg>
  ),
)
KauryShield.displayName = "KauryShield"

/* =============================================================
   Star — estrella 5 puntas con punto interior
   (premium / destacado)
   ============================================================= */
export const KauryStar = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size, className, ...props }, ref) => (
    <svg ref={ref} {...baseProps(size)} className={className} {...props}>
      <path
        d="m12 3 2.7 5.5 6 .9-4.4 4.3 1.1 6.1L12 17l-5.4 2.8 1.1-6.1L3.3 9.4l6-.9z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="m12 3 2.7 5.5 6 .9-4.4 4.3 1.1 6.1L12 17l-5.4 2.8 1.1-6.1L3.3 9.4l6-.9z" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
)
KauryStar.displayName = "KauryStar"

/* =============================================================
   Heart — corazón estilizado (branding)
   ============================================================= */
export const KauryHeart = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size, className, ...props }, ref) => (
    <svg ref={ref} {...baseProps(size)} className={className} {...props}>
      <path
        d="M12 20.5C9 18.5 4 15 4 10.2 4 7.3 6.3 5 9 5c1.7 0 3 .9 3 2.5C12 5.9 13.3 5 15 5c2.7 0 5 2.3 5 5.2 0 4.8-5 8.3-8 10.3z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M12 20.5C9 18.5 4 15 4 10.2 4 7.3 6.3 5 9 5c1.7 0 3 .9 3 2.5C12 5.9 13.3 5 15 5c2.7 0 5 2.3 5 5.2 0 4.8-5 8.3-8 10.3z" />
    </svg>
  ),
)
KauryHeart.displayName = "KauryHeart"

/* =============================================================
   Arrow — flecha con curva sutil
   (reemplaza ArrowRight)
   ============================================================= */
export const KauryArrow = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size, className, ...props }, ref) => (
    <svg ref={ref} {...baseProps(size)} className={className} {...props}>
      <path d="M4.5 12h14" />
      <path d="M13.5 6.5 19.5 12l-6 5.5" />
      <path d="M4.5 12c2-3 4-4 8-4" strokeOpacity="0.4" strokeWidth="1.2" />
    </svg>
  ),
)
KauryArrow.displayName = "KauryArrow"

/* =============================================================
   Bell — campana con onda
   (reemplaza Bell)
   ============================================================= */
export const KauryBell = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size, className, ...props }, ref) => (
    <svg ref={ref} {...baseProps(size)} className={className} {...props}>
      <path
        d="M6 16V11a6 6 0 0 1 12 0v5l1.4 2H4.6L6 16z"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path d="M6 16V11a6 6 0 0 1 12 0v5l1.4 2H4.6L6 16z" />
      <path d="M10 21h4" />
      <circle cx="12" cy="3.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
)
KauryBell.displayName = "KauryBell"

/* =============================================================
   Logout — flecha saliendo de marco
   (reemplaza LogOut)
   ============================================================= */
export const KauryLogout = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size, className, ...props }, ref) => (
    <svg ref={ref} {...baseProps(size)} className={className} {...props}>
      <path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" />
      <path d="M16 8 20 12 16 16" />
      <path d="M20 12H10" />
    </svg>
  ),
)
KauryLogout.displayName = "KauryLogout"

/* =============================================================
   Search — lupa con mango grueso
   (reemplaza Search)
   ============================================================= */
export const KaurySearch = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size, className, ...props }, ref) => (
    <svg ref={ref} {...baseProps(size)} className={className} {...props}>
      <circle cx="11" cy="11" r="6.5" fill="currentColor" fillOpacity="0.1" />
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" strokeWidth="2" />
    </svg>
  ),
)
KaurySearch.displayName = "KaurySearch"

/* =============================================================
   Plus — más con halo
   ============================================================= */
export const KauryPlus = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size, className, ...props }, ref) => (
    <svg ref={ref} {...baseProps(size)} className={className} {...props}>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.08" stroke="none" />
      <path d="M12 6.5V17.5M6.5 12h11" strokeWidth="1.8" />
    </svg>
  ),
)
KauryPlus.displayName = "KauryPlus"

/* =============================================================
   Check — check con círculo
   ============================================================= */
export const KauryCheck = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size, className, ...props }, ref) => (
    <svg ref={ref} {...baseProps(size)} className={className} {...props}>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.12" />
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.5 2.5L16 9.5" strokeWidth="1.8" />
    </svg>
  ),
)
KauryCheck.displayName = "KauryCheck"

/* =============================================================
   Alert — triángulo con exclamación
   (reemplaza AlertCircle)
   ============================================================= */
export const KauryAlert = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size, className, ...props }, ref) => (
    <svg ref={ref} {...baseProps(size)} className={className} {...props}>
      <path
        d="M12 3.5 21 19H3z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M12 3.5 21 19H3z" />
      <path d="M12 9.5v4.5" strokeWidth="1.8" />
      <circle cx="12" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
)
KauryAlert.displayName = "KauryAlert"

/* =============================================================
   Loader — anillo con segmento brillante
   (reemplaza Loader2)
   ============================================================= */
export const KauryLoader = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size, className, ...props }, ref) => (
    <svg
      ref={ref}
      {...baseProps(size)}
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="8.5" strokeOpacity="0.18" strokeWidth="2" />
      <path d="M20.5 12a8.5 8.5 0 0 0-8.5-8.5" strokeWidth="2" />
    </svg>
  ),
)
KauryLoader.displayName = "KauryLoader"

/* =============================================================
   GiftBox — caja con moño
   (reemplaza Gift)
   ============================================================= */
export const KauryGift = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size, className, ...props }, ref) => (
    <svg ref={ref} {...baseProps(size)} className={className} {...props}>
      <rect
        x="3.5"
        y="9"
        width="17"
        height="11"
        rx="1.5"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <rect x="3.5" y="9" width="17" height="11" rx="1.5" />
      <path d="M3 13h18" />
      <path d="M12 9V20" />
      <path d="M12 9c-2-2-4-2-4 0 0 1.5 1.5 2 4 2 2.5 0 4-.5 4-2 0-2-2-2-4 0z" fill="currentColor" fillOpacity="0.18" />
    </svg>
  ),
)
KauryGift.displayName = "KauryGift"

/* =============================================================
   Coupon — tarjeta cortada con porcentaje
   (reemplaza BadgePercent)
   ============================================================= */
export const KauryCoupon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size, className, ...props }, ref) => (
    <svg ref={ref} {...baseProps(size)} className={className} {...props}>
      <path
        d="M3 7v3a2 2 0 0 1 0 4v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3a2 2 0 0 1 0-4V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1z"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path d="M3 7v3a2 2 0 0 1 0 4v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3a2 2 0 0 1 0-4V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1z" />
      <path d="m9.5 14.5 5-5" />
      <circle cx="9.5" cy="9.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="14.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
)
KauryCoupon.displayName = "KauryCoupon"

/* =============================================================
   ShoppingBag — bolsa con asa
   (reemplaza ShoppingBag para Órdenes)
   ============================================================= */
export const KauryBag = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size, className, ...props }, ref) => (
    <svg ref={ref} {...baseProps(size)} className={className} {...props}>
      <path
        d="M5 8h14l-1 12.5a1 1 0 0 1-1 .9H7a1 1 0 0 1-1-.9z"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path d="M5 8h14l-1 12.5a1 1 0 0 1-1 .9H7a1 1 0 0 1-1-.9z" />
      <path d="M9 11V7a3 3 0 0 1 6 0v4" />
    </svg>
  ),
)
KauryBag.displayName = "KauryBag"

/* =============================================================
   ChartGrowth — barras crecientes
   (reemplaza BarChart2)
   ============================================================= */
export const KauryChart = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size, className, ...props }, ref) => (
    <svg ref={ref} {...baseProps(size)} className={className} {...props}>
      <rect x="3.5" y="14" width="3.5" height="6.5" rx="0.8" fill="currentColor" fillOpacity="0.18" />
      <rect x="10.25" y="9.5" width="3.5" height="11" rx="0.8" fill="currentColor" fillOpacity="0.18" />
      <rect x="17" y="5" width="3.5" height="15.5" rx="0.8" fill="currentColor" fillOpacity="0.18" />
      <rect x="3.5" y="14" width="3.5" height="6.5" rx="0.8" />
      <rect x="10.25" y="9.5" width="3.5" height="11" rx="0.8" />
      <rect x="17" y="5" width="3.5" height="15.5" rx="0.8" />
    </svg>
  ),
)
KauryChart.displayName = "KauryChart"

/* =============================================================
   WhatsApp — bocadillo con cola + auricular
   ============================================================= */
export const KauryWhatsapp = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size, className, ...props }, ref) => (
    <svg ref={ref} {...baseProps(size)} className={className} {...props}>
      <path
        d="M12 3.5a8.5 8.5 0 0 0-7.4 12.8L3.5 20.5l4.4-1.05A8.5 8.5 0 1 0 12 3.5z"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path d="M12 3.5a8.5 8.5 0 0 0-7.4 12.8L3.5 20.5l4.4-1.05A8.5 8.5 0 1 0 12 3.5z" />
      <path
        d="M9 8.7c.1-.3.3-.4.5-.4h.5c.2 0 .4.1.5.3l.7 1.6c.1.2.1.4-.1.6l-.5.5c-.1.1-.1.2 0 .4.4.7 1 1.3 1.7 1.7.2.1.3.1.4 0l.5-.5c.2-.2.4-.2.6-.1l1.6.7c.2.1.3.3.3.5v.5c0 .2-.1.4-.4.5-1.4.6-3 .3-4.4-.7-1.1-.8-1.9-2-2.2-3.4-.2-.7-.1-1.4.3-1.7z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  ),
)
KauryWhatsapp.displayName = "KauryWhatsapp"
