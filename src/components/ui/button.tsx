
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--background))] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "luxury-button",
        destructive:
          "bg-[rgb(var(--destructive))] text-[rgb(var(--destructive-foreground))] hover:bg-[rgb(var(--destructive))]/90 rounded-full px-8 py-4 font-semibold border-0 shadow-lg hover:shadow-xl min-h-[44px]",
        outline:
          "premium-outline-button",
        secondary:
          "secondary-button",
        ghost: "hover:bg-[rgb(var(--muted))]/20 text-[rgb(var(--text-primary))] hover:text-[rgb(var(--text-primary))] rounded-full px-6 py-3 font-medium border-0 min-h-[44px]",
        link: "text-[rgb(var(--primary))] underline-offset-4 hover:underline font-medium hover:text-[rgb(var(--primary-hover))] transition-colors p-0 h-auto",
        success: "bg-[rgb(var(--success))] text-[rgb(var(--success-foreground))] hover:bg-[rgb(var(--success))]/90 rounded-full px-8 py-4 font-semibold border-0 shadow-lg hover:shadow-xl min-h-[44px]"
      },
      size: {
        default: "rounded-full px-8 py-4 text-base min-h-[44px]",
        sm: "rounded-full px-6 py-3 text-sm font-medium min-h-[36px]",
        lg: "rounded-full px-10 py-5 text-lg font-semibold min-h-[48px]",
        icon: "rounded-full h-11 w-11 p-0 min-h-[44px] min-w-[44px]",
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
