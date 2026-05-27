import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-black hover:brightness-105 shadow-md shadow-amber-500/15 border border-amber-500/20",
        destructive:
          "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:brightness-105 shadow-md shadow-red-500/15 active:scale-[0.98] transition-all",
        outline:
          "border border-amber-500/30 dark:border-amber-500/20 bg-background/50 shadow-sm hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 dark:bg-input/30 dark:border-input/30",
        secondary:
          "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/10 hover:border-amber-500/25",
        ghost:
          "hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 text-foreground dark:hover:bg-amber-500/5",
        link: "text-amber-600 dark:text-amber-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-9 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 rounded-xl px-6 has-[>svg]:px-4",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
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
  variant,
  size,
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
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
