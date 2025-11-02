import * as React from "react";
import { cn } from "./utils";
import { Label } from "./label";

export interface CustomInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className, type, label, error, containerClassName, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <Label htmlFor={inputId} className="mb-2 block text-brand-dark">
            {label}
          </Label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            "flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);
CustomInput.displayName = "CustomInput";

export { CustomInput };
