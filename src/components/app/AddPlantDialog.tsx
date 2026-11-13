import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOCATIONS } from "@/lib/data";
import { getToday, toISO } from "@/lib/dates";
import { useGarden } from "@/lib/garden-store";
import { HEALTH_LEVELS, SUNLIGHT_LEVELS, type Health, type Sunlight } from "@/lib/inventory";
import { plantImage, plantImageKeys } from "@/lib/plant-images";
import { cn } from "@/lib/utils";

const empty = {
  name: "",
  species: "",
  location: "Living Room",
  sunlight: "Indirect Light" as Sunlight,
  waterEveryDays: 7,
  fertilizeEveryDays: 30,
  health: "Healthy" as Health,
  imageKey: "monstera",
};

export function AddPlantDialog() {
  const { addPlantOpen, setAddPlantOpen, addPlant } = useGarden();
  const [form, setForm] = useState(empty);
  const set = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const todayISO = toISO(getToday());
    addPlant({
      name: form.name.trim(),
      species: form.species.trim() || "—",
      imageKey: form.imageKey,
      location: form.location,
      sunlight: form.sunlight,
      waterEveryDays: Math.max(1, form.waterEveryDays),
      fertilizeEveryDays: Math.max(1, form.fertilizeEveryDays),
      health: form.health,
      lastWatered: todayISO,
      lastFertilized: todayISO,
    });
    toast.success(`${form.name.trim()} added to your garden`);
    setForm(empty);
    setAddPlantOpen(false);
  };

  return (
    <Dialog open={addPlantOpen} onOpenChange={setAddPlantOpen}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary">Add a new plant</DialogTitle>
          <DialogDescription>
            We'll schedule watering and feeding reminders for you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="mb-2 block">Photo</Label>
            <div className="grid grid-cols-6 gap-2">
              {plantImageKeys.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => set("imageKey", k)}
                  aria-label={k}
                  className={cn(
                    "aspect-square overflow-hidden rounded-lg border-2 transition",
                    form.imageKey === k
                      ? "border-leaf"
                      : "border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <img
                    src={plantImage(k)}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pname">Plant name</Label>
              <Input
                id="pname"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Sweet Basil"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pspecies">Species / variety</Label>
              <Input
                id="pspecies"
                value={form.species}
                onChange={(e) => set("species", e.target.value)}
                placeholder="Ocimum basilicum"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Select value={form.location} onValueChange={(v) => set("location", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Sunlight</Label>
              <Select value={form.sunlight} onValueChange={(v) => set("sunlight", v as Sunlight)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUNLIGHT_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pwater">Water every (days)</Label>
              <Input
                id="pwater"
                type="number"
                min={1}
                value={form.waterEveryDays}
                onChange={(e) => set("waterEveryDays", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pfeed">Fertilize every (days)</Label>
              <Input
                id="pfeed"
                type="number"
                min={1}
                value={form.fertilizeEveryDays}
                onChange={(e) => set("fertilizeEveryDays", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Current health</Label>
              <Select value={form.health} onValueChange={(v) => set("health", v as Health)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HEALTH_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setAddPlantOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="leaf">
              Add to garden
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
