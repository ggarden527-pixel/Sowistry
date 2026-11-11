import { Sun } from "lucide-react";
import type { ReactNode } from "react";

import { sunStrength, type Health, type Sunlight } from "@/lib/inventory";
import { plantImage } from "@/lib/plant-images";
import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-3xl font-semibold sm:text-[2.5rem] sm:leading-[1.1]">{title}</h1>
        {subtitle && <p className="mt-2 text-[0.95rem] text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function PlantThumb({ imageKey, size = "md", className }: { imageKey: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const dims = { sm: "h-9 w-9", md: "h-12 w-12", lg: "h-14 w-14" }[size];
  return (
    <div className={cn("shrink-0 overflow-hidden rounded-xl border border-border bg-muted", dims, className)}>
      <img src={plantImage(imageKey)} alt="" loading="lazy" width={816} height={816} className="h-full w-full object-cover" />
    </div>
  );
}

export function SunMeter({ sunlight }: { sunlight: Sunlight }) {
  const level = sunStrength[sunlight];
  return (
    <div>
      <div className="flex gap-0.5" aria-label={`${sunlight}`}>
        {[1, 2, 3].map((i) => (
          <Sun key={i} className={cn("h-4 w-4", i <= level ? "text-sun" : "text-border")} strokeWidth={2.2} />
        ))}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{sunlight}</p>
    </div>
  );
}

const healthStyles: Record<Health, string> = {
  Thriving: "bg-leaf-soft text-primary",
  Healthy: "bg-secondary text-leaf",
  "Needs Attention": "bg-warning-soft text-warning",
  "At Risk": "bg-destructive-soft text-destructive",
};

export function HealthBadge({ health }: { health: Health }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", healthStyles[health])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {health}
    </span>
  );
}

export function SectionTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}
