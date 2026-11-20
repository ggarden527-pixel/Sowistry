import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOCATIONS, searchLibraryPlants, type LibraryPlant } from "@/lib/data";
import { getToday, toISO } from "@/lib/dates";
import { useGarden } from "@/lib/garden-store";
import { HEALTH_LEVELS, SUNLIGHT_LEVELS, type Health, type Sunlight } from "@/lib/inventory";
import { plantImage, plantImageKeys } from "@/lib/plant-images";
import { cn } from "@/lib/utils";

const empty = {
  libraryPlantId: "",
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
  const set = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const suggestions = useMemo(() => searchLibraryPlants(form.name).slice(0, 6), [form.name]);

  const selectLibraryPlant = (plant: LibraryPlant) => {
    setForm((current) => ({
      ...current,
      libraryPlantId: plant.id,
      name: plant.name,
      species: plant.latin,
      imageKey: plant.imageKey,
      sunlight: plant.sunlight,
      waterEveryDays: plant.waterEveryDays,
      fertilizeEveryDays: plant.fertilizeEveryDays,
    }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const todayISO = toISO(getToday());
    addPlant({
      ...(form.libraryPlantId ? { libraryPlantId: form.libraryPlantId } : {}),
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
          <DialogDescription>Choose a library plant or add your own. You can adjust the reminder estimates before saving.</DialogDescription>
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
                    form.imageKey === k ? "border-leaf" : "border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <img src={plantImage(k)} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pname">Plant name</Label>
              <div className="relative">
                <Input id="pname" required value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value, libraryPlantId: "" }))} placeholder="Search Sweet Basil, tomato or a scientific name" />
                {form.name.trim() && suggestions.length > 0 && (
                  <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-lift">
                    {suggestions.map((plant) => (
                      <button
                        key={plant.id}
                        type="button"
                        onClick={() => selectLibraryPlant(plant)}
                        className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-secondary"
                      >
                        <img src={plantImage(plant.imageKey)} alt="" className="h-8 w-8 rounded object-cover" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{plant.name}</span>
                          <span className="block truncate text-xs italic text-muted-foreground">{plant.latin}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pspecies">Species / variety</Label>
              <Input id="pspecies" value={form.species} onChange={(e) => set("species", e.target.value)} placeholder="Ocimum basilicum" />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Select value={form.location} onValueChange={(v) => set("location", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Sunlight</Label>
              <Select value={form.sunlight} onValueChange={(v) => set("sunlight", v as Sunlight)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUNLIGHT_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pwater">Watering reminder interval (days)</Label>
              <Input id="pwater" type="number" min={1} value={form.waterEveryDays} onChange={(e) => set("waterEveryDays", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pfeed">Fertilizing reminder interval (days)</Label>
              <Input id="pfeed" type="number" min={1} value={form.fertilizeEveryDays} onChange={(e) => set("fertilizeEveryDays", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Current health</Label>
              <Select value={form.health} onValueChange={(v) => set("health", v as Health)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HEALTH_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setAddPlantOpen(false)}>Cancel</Button>
            <Button type="submit" variant="leaf">Add to garden</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
