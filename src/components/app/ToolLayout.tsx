import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PageHeader } from "./bits";

export function ToolLayout({ title, subtitle, form, result, footer }: { title: string; subtitle: string; form: ReactNode; result: ReactNode; footer?: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl">
      <Link to="/tools" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Gardening Tools
      </Link>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="surface p-6">{form}</div>
        <div className="surface leaf-pattern self-start p-6">{result}</div>
      </div>
      {footer && <div className="mt-6">{footer}</div>}
    </div>
  );
}

export function NumberField({ id, label, value, onChange, suffix, min = 0, step = 1 }: { id: string; label: string; value: number; onChange: (n: number) => void; suffix?: string; min?: number; step?: number }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} type="number" min={min} step={step} value={Number.isFinite(value) ? value : ""} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} className="h-11 pr-14" />
        {suffix && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

export function ResultRow({ label, value, strong }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/70 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={strong ? "font-display text-2xl font-semibold text-primary" : "text-sm font-semibold text-primary"}>{value}</span>
    </div>
  );
}

export function ChoiceChips<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={value === o}
            onClick={() => onChange(o)}
            className={
              value === o
                ? "rounded-lg border border-primary bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground"
                : "rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground hover:border-leaf"
            }
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
