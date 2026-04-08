import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center text-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
  {
    variants: {
      variant: {
        neutral:
          "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80",
        positive:
          "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80",
        warning:
          "bg-amber-100 text-amber-700 ring-1 ring-amber-200/80",
        critical:
          "bg-rose-100 text-rose-700 ring-1 ring-rose-200/80",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

type BadgeProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
