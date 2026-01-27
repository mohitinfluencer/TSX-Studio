import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-neon-cyan hover:shadow-[0_0_20px_rgba(39,242,255,0.4)]",
        neon: "bg-neon-cyan text-black hover:bg-neon-cyan/90 border border-neon-cyan/20 shadow-[0_0_15px_rgba(39,242,255,0.2)]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-white/10 bg-white/5 shadow-xs hover:bg-white/10 hover:text-white dark:bg-input/10 dark:border-white/5 dark:hover:bg-white/10",
        secondary:
          "bg-neon-lime text-black hover:bg-neon-lime/90 shadow-[0_0_15px_rgba(183,255,60,0.2)]",
        ghost:
          "hover:bg-white/5 hover:text-neon-cyan",
        link: "text-neon-cyan underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        xs: "h-6 gap-1 rounded-md px-2 text-[10px]",
        sm: "h-9 rounded-lg gap-1.5 px-4",
        lg: "h-14 rounded-2xl px-10 text-base italic",
        icon: "size-11",
        "icon-xs": "size-6 rounded-md",
        "icon-sm": "size-9",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }), "font-display")}
      {...props}
    />
  )
}

export { Button, buttonVariants }
