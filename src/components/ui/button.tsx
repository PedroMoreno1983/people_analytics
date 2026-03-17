import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-[#4f8d96]/22 bg-[linear-gradient(135deg,#3b7e87_0%,#50939a_52%,#73b0ad_100%)] text-white shadow-[0_18px_36px_-26px_rgba(55,109,119,0.42)] hover:-translate-y-0.5 hover:brightness-[1.04] focus-visible:ring-[#4f8d96]",
        secondary:
          "border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,250,251,0.98))] text-slate-900 shadow-[0_16px_36px_-26px_rgba(35,58,79,0.22)] hover:-translate-y-0.5 hover:border-[#c9d8e0] hover:bg-white focus-visible:ring-slate-400",
        ghost:
          "text-slate-700 hover:bg-slate-100/80 focus-visible:ring-slate-400"
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
