
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-[#F39C0A]/30 bg-[#F39C0A]/10 text-[#F39C0A] hover:bg-[#F39C0A]/20 shadow-lg",
        secondary:
          "border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 shadow-lg",
        destructive:
          "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-400/50",
        outline: "text-slate-200 border-slate-600 hover:bg-slate-800/50",
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
