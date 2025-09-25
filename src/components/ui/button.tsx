import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Neon cyberpunk variants
        neon: "bg-gradient-to-r from-neon-cyan to-neon-purple text-background font-bold hover:shadow-[0_0_20px_hsl(180_100%_50%/0.5)] hover:scale-105 transition-all duration-200 ripple",
        "neon-outline": "border-2 border-neon-cyan bg-transparent text-neon-cyan hover:bg-neon-cyan hover:text-background hover:shadow-[0_0_20px_hsl(180_100%_50%/0.5)] transition-all duration-200 ripple",
        "neon-purple": "bg-neon-purple text-background font-bold hover:shadow-[0_0_20px_hsl(271_76%_53%/0.5)] hover:scale-105 transition-all duration-200 ripple",
        "neon-ghost": "bg-transparent text-neon-cyan hover:bg-neon-cyan/10 hover:shadow-[0_0_15px_hsl(180_100%_50%/0.3)] transition-all duration-200",
        "neon-success": "bg-success text-background font-bold hover:shadow-[0_0_20px_hsl(120_100%_40%/0.5)] hover:scale-105 transition-all duration-200 ripple",
        "neon-danger": "bg-destructive text-background font-bold hover:shadow-[0_0_20px_hsl(0_100%_50%/0.5)] hover:scale-105 transition-all duration-200 ripple",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-12 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
