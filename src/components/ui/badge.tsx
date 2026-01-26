import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-3 py-1 text-[10px] font-black uppercase tracking-widest w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all overflow-hidden italic",
  {
    variants: {
      variant: {
        default: "bg-white text-black",
        neon: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20 shadow-[0_0_15px_rgba(39,242,255,0.1)]",
        secondary:
          "bg-neon-lime/10 text-neon-lime border-neon-lime/20",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/20",
        outline:
          "border-white/10 text-muted-foreground bg-white/5",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
