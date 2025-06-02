
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-gold-500/50 bg-gold-500/20 text-gold-500 hover:bg-gold-500/30 neon-border font-orbitron",
        secondary:
          "border-cyber-surface bg-cyber-card text-cyber-white hover:bg-cyber-surface shadow-glass",
        destructive:
          "border-red-500/50 bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-400/50",
        outline: "text-cyber-white border-white/30 hover:bg-white/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
