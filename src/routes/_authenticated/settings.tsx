import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { initials } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/bits";
import { ChoiceChips } from "@/components/app/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useGarden, type Settings } from "@/lib/garden-store";

export const Route = createFileRoute("/_authenticated/settings")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Settings — Sowistry" },
      { name: "description", content: "Manage your profile, garden location, units and reminder preferences." },
      { property: "og:title", content: "Settings — Sowistry" },
      { property: "og:description", content: "Manage your profile, garden location, units and reminders." },
    ],
  }),
  component: SettingsPage,
});

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="surface grid gap-6 p-6 md:grid-cols-[240px_minmax(0,1fr)]">
      <div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ToggleRow({ id, label, desc, checked, onChange }: { id: string; label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-semibold text-primary">{label}</Label>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} className="data-[state=checked]:bg-leaf" />
    </div>
  );
}

function SettingsPage() {
  const { settings, updateSettings } = useGarden();
  const [form, setForm] = useState<Settings>(settings);
  useEffect(() => setForm(settings), [settings]);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setForm((f) => ({ ...f, [k]: v }));
  const dirty = JSON.stringify(form) !== JSON.stringify(settings);

  return (
    <form
      className="mx-auto max-w-5xl"
      onSubmit={(e) => {
        e.preventDefault();
        updateSettings(form);
        toast.success("Settings saved");
      }}
    >
      <PageHeader
        title="Settings"
        subtitle="Make Sowistry fit the way you garden."
        actions={
          <>
            <Button type="button" variant="ghost" disabled={!dirty} onClick={() => setForm(settings)}>Discard</Button>
            <Button type="submit" variant="leaf" size="lg" disabled={!dirty}>Save changes</Button>
          </>
        }
      />
      <div className="space-y-5">
        <Section title="Profile" desc="How you appear across Sowistry.">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-primary font-display text-xl font-bold text-primary-foreground">{initials(form.name || "?")}</span>
            <div>
              <p className="font-semibold text-primary">{form.name || "Your name"}</p>
              <p className="text-sm text-muted-foreground">{form.email}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} readOnly aria-describedby="email-hint" className="h-11 bg-muted text-muted-foreground" />
              <p id="email-hint" className="text-xs text-muted-foreground">This is the email you sign in with.</p>
            </div>
          </div>
        </Section>

        <Section title="Garden" desc="Used to tailor planting dates and tips.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="loc">Location</Label>
              <Input id="loc" value={form.location} onChange={(e) => set("location", e.target.value)} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zone">Hardiness zone</Label>
              <Input id="zone" value={form.zone} onChange={(e) => set("zone", e.target.value)} className="h-11" />
            </div>
          </div>
          <ChoiceChips label="Units" options={["imperial", "metric"] as const} value={form.units} onChange={(v) => set("units", v)} />
        </Section>

        <Section title="Reminders" desc="Choose what Sowistry nudges you about.">
          <ToggleRow id="nw" label="Watering reminders" desc="A morning nudge when plants are due for water." checked={form.notifyWatering} onChange={(v) => set("notifyWatering", v)} />
          <ToggleRow id="np" label="Planting reminders" desc="Heads-up a few days before sowing and transplant dates." checked={form.notifyPlanting} onChange={(v) => set("notifyPlanting", v)} />
          <ToggleRow id="wd" label="Weekly garden digest" desc="A Sunday summary of the week ahead." checked={form.weeklyDigest} onChange={(v) => set("weeklyDigest", v)} />
        </Section>
      </div>
    </form>
  );
}
