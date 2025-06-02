
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] hover:scale-105",
  {
    variants: {
      variant: {
        default: "premium-button",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl font-bold",
        outline:
          "outline-button",
        secondary:
          "bg-[#2A2A2A] text-white hover:bg-[#3A3A3A] shadow-md hover:shadow-lg font-semibold border border-white/10",
        ghost: "hover:bg-white/10 text-white hover:shadow-sm font-medium rounded-lg",
        link: "text-gold-500 underline-offset-4 hover:underline font-semibold hover:text-gold-400",
        luxury: "bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] text-white hover:from-[#2A2A2A] hover:to-[#3A3A3A] shadow-lg hover:shadow-xl border border-gold-500/30 hover:border-gold-400 font-bold"
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-lg px-4 text-sm font-semibold",
        lg: "h-14 rounded-xl px-8 text-lg font-bold",
        icon: "h-12 w-12",
        xl: "h-16 rounded-2xl px-10 text-xl font-bold"
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
