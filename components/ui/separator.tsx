import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

const Separator = React.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={
      `shrink-0 bg-border ${
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"
      } ${className || ""}`
    }
    {...props}
  />
))
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }

// Alternative version without Radix UI dependency
export const SimpleSeparator = React.forwardRef(({ 
  className, 
  orientation = "horizontal", 
  ...props 
}, ref) => (
  <div
    ref={ref}
    role="separator"
    aria-orientation={orientation}
    className={
      `shrink-0 bg-gray-200 ${
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"
      } ${className || ""}`
    }
    {...props}
  />
))
SimpleSeparator.displayName = "SimpleSeparator"