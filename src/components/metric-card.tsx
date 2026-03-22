import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone: "positive" | "warning" | "critical" | "neutral";
  footer?: string;
};

const toneBackground: Record<MetricCardProps["tone"], string> = {
  positive: "bg-emerald-50/60 border-emerald-200/60",
  warning: "bg-amber-50/60 border-amber-200/60",
  critical: "bg-rose-50/60 border-rose-200/60",
  neutral: "bg-slate-50/60 border-slate-200/60",
};

const toneValue: Record<MetricCardProps["tone"], string> = {
  positive: "text-emerald-900",
  warning: "text-amber-900",
  critical: "text-rose-900",
  neutral: "text-slate-900",
};

export function MetricCard({ label, value, detail, tone, footer }: MetricCardProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-[24px] border p-5 transition-shadow hover:shadow-md",
        toneBackground[tone]
      )}
    >
      <Badge variant={tone} className="self-start">
        {label}
      </Badge>
      <p className={cn("mt-4 font-serif text-4xl font-semibold tracking-tight", toneValue[tone])}>
        {value}
      </p>
      <p className="mt-2 flex-1 text-xs leading-5 text-slate-600">{detail}</p>
      {footer ? (
        <p className="mt-3 border-t border-current/10 pt-3 text-xs font-medium text-slate-500">
          {footer}
        </p>
      ) : null}
    </div>
  );
}
