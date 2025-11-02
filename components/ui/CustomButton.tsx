"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-brand-dark text-white hover:bg-brand-dark/90 active:scale-95",
        secondary: "bg-brand-accent text-brand-dark hover:bg-brand-accent/90 active:scale-95",
        outline: "border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white",
        ghost: "hover:bg-brand-dark/10 text-brand-dark",
        destructive: "bg-red-600 text-white hover:bg-red-700 active:scale-95",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-6",
        lg: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

CustomButton.displayName = "CustomButton";

export { CustomButton, buttonVariants };
