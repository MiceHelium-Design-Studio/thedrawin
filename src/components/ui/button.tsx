
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--system-background))] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] relative overflow-hidden touch-target",
  {
    variants: {
      variant: {
        default: "luxury-button",
        destructive:
          "bg-[rgb(var(--destructive))] text-[rgb(var(--destructive-foreground))] hover:bg-[rgb(var(--destructive))]/90 rounded-full px-8 py-4 font-semibold border-0 shadow-lg hover:shadow-xl",
        outline:
          "premium-outline-button",
        secondary:
          "secondary-button",
        ghost: "hover:bg-[rgb(var(--secondary-system-fill))]/20 text-[rgb(var(--label-primary))] hover:text-[rgb(var(--label-primary))] rounded-full px-6 py-3 font-medium border-0",
        link: "text-[rgb(var(--primary))] underline-offset-4 hover:underline font-medium hover:text-[rgb(var(--primary))]/80 transition-colors p-0 h-auto",
        luxury: "bg-gradient-to-r from-[rgb(var(--secondary-system-background))] to-[rgb(var(--tertiary-system-background))] text-[rgb(var(--label-primary))] hover:from-[rgb(var(--tertiary-system-background))] hover:to-[rgb(var(--secondary-system-background))] rounded-full px-8 py-4 shadow-apple-md hover:shadow-apple-lg border border-[rgb(var(--border))] font-semibold backdrop-blur-sm"
      },
      size: {
        default: "rounded-full px-8 py-4 text-base min-h-[44px]",
        sm: "rounded-full px-6 py-3 text-sm font-medium min-h-[36px]",
        lg: "rounded-full px-10 py-5 text-lg font-semibold min-h-[48px]",
        icon: "rounded-full h-11 w-11 p-0",
        xl: "rounded-full px-12 py-6 text-xl font-semibold min-h-[52px]"
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
