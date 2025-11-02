import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-brand-dark text-white",
        success: "bg-green-100 text-green-800 border border-green-200",
        warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        error: "bg-red-100 text-red-800 border border-red-200",
        info: "bg-blue-100 text-blue-800 border border-blue-200",
        accent: "bg-brand-accent text-brand-dark",
        outline: "border border-brand-dark text-brand-dark bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CustomBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function CustomBadge({ className, variant, ...props }: CustomBadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { CustomBadge, badgeVariants };
