
import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"

interface ScrollControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  onScrollLeft?: () => void
  onScrollRight?: () => void
  showControls?: boolean
}

const ScrollControls = React.forwardRef<HTMLDivElement, ScrollControlsProps>(
  ({ className, orientation = "horizontal", onScrollLeft, onScrollRight, showControls = false, ...props }, ref) => {
    if (!showControls || orientation !== "horizontal") return null

    return (
      <div 
        ref={ref}
        className={cn(
          "flex absolute top-1/2 -translate-y-1/2 w-full justify-between pointer-events-none",
          className
        )}
        {...props}
      >
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 rounded-full opacity-80 hover:opacity-100 pointer-events-auto"
          onClick={onScrollLeft}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Scroll left</span>
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 rounded-full opacity-80 hover:opacity-100 pointer-events-auto"
          onClick={onScrollRight}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Scroll right</span>
        </Button>
      </div>
    )
  }
)
ScrollControls.displayName = "ScrollControls"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
    showControls?: boolean
  }
>(({ className, children, showControls = false, ...props }, ref) => {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  
  const scrollLeft = () => {
    if (!scrollAreaRef.current) return
    const container = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
    if (!container) return
    
    const scrollAmount = 200
    container.scrollBy({ left: -scrollAmount, behavior: "smooth" })
  }
  
  const scrollRight = () => {
    if (!scrollAreaRef.current) return
    const container = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
    if (!container) return
    
    const scrollAmount = 200
    container.scrollBy({ left: scrollAmount, behavior: "smooth" })
  }
  
  return (
    <div className="relative" ref={scrollAreaRef}>
      <ScrollAreaPrimitive.Root
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
          {children}
        </ScrollAreaPrimitive.Viewport>
        <ScrollBar />
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
      <ScrollControls 
        showControls={showControls} 
        onScrollLeft={scrollLeft} 
        onScrollRight={scrollRight} 
      />
    </div>
  )
})
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
