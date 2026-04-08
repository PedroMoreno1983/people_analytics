import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 !text-white hover:bg-indigo-700 hover:!text-white shadow-md shadow-indigo-200 focus-visible:ring-indigo-500",
        secondary: "border border-slate-200 bg-white !text-slate-900 hover:border-slate-300 hover:bg-slate-50 hover:!text-slate-900 focus-visible:ring-slate-400",
        ghost: "!text-slate-700 hover:bg-slate-100 hover:!text-slate-700 focus-visible:ring-slate-400"
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4",
        lg: "h-12 px-6"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
