import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon: Icon,
  footer,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  footer?: ReactNode;
}) {
  return (
    <div className="surface animate-rise p-5 transition-shadow hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{label}</p>
          <p className="mt-2 font-display text-[1.875rem] font-semibold leading-none text-primary">
            {value}
          </p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-primary">
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
      </div>
      {footer && <div className="mt-4 text-xs">{footer}</div>}
    </div>
  );
}
