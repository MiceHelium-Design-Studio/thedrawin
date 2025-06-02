
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] hover:scale-[1.02] relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "luxury-button",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-red-500/25 font-semibold border border-red-500/20 hover:border-red-400/40",
        outline:
          "premium-outline-button",
        secondary:
          "bg-slate-800 text-slate-100 hover:bg-slate-700 shadow-lg hover:shadow-slate-500/10 font-medium border border-slate-700/50 hover:border-slate-600/70",
        ghost: "hover:bg-white/5 text-slate-300 hover:text-white hover:shadow-lg font-medium rounded-xl border border-transparent hover:border-white/10",
        link: "text-[#F39C0A] underline-offset-4 hover:underline font-medium hover:text-[#FFA726] transition-colors",
        luxury: "bg-gradient-to-r from-slate-800 to-slate-700 text-white hover:from-slate-700 hover:to-slate-600 shadow-lg hover:shadow-slate-500/20 border border-[#F39C0A]/20 hover:border-[#F39C0A]/40 font-semibold"
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-4 text-xs font-medium",
        lg: "h-12 rounded-xl px-8 text-base font-semibold",
        icon: "h-11 w-11",
        xl: "h-14 rounded-2xl px-10 text-lg font-semibold"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
