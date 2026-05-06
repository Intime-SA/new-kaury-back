import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-brand text-white shadow-pop",
        secondary:
          "border-border/60 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/15",
        outline:
          "border-border bg-card text-foreground",
        soft:
          "border-transparent bg-accent text-accent-foreground hover:bg-accent/80",
        success:
          "border-transparent bg-success/10 text-success hover:bg-success/15",
        warning:
          "border-transparent bg-warning/10 text-warning hover:bg-warning/15",
        info:
          "border-transparent bg-info/10 text-info hover:bg-info/15",
        gradient:
          "border-transparent bg-gradient-brand text-white shadow-pop",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
