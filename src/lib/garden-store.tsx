import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { seedPlants, seedTasks } from "./data";
import { getToday, toISO } from "./dates";
import type { Plant } from "./inventory";
import type { Task } from "./tasks";

export interface Settings {
  name: string;
  email: string;
  location: string;
  zone: string;
  units: "imperial" | "metric";
  notifyWatering: boolean;
  notifyPlanting: boolean;
  weeklyDigest: boolean;
}

const defaultSettings: Settings = {
  name: "Amara Khan",
  email: "amara@sowistry.app",
  location: "Lahore, Pakistan",
  zone: "10a",
  units: "imperial",
  notifyWatering: true,
  notifyPlanting: true,
  weeklyDigest: false,
};

const STORAGE_KEY = "sowistry:v1";

interface GardenState {
  plants: Plant[];
  tasks: Task[];
  settings: Settings;
  addPlant: (p: Omit<Plant, "id">) => void;
  removePlant: (id: string) => void;
  waterPlant: (id: string) => void;
  toggleTask: (id: string) => void;
  addTask: (t: Omit<Task, "id" | "done">) => void;
  updateSettings: (s: Partial<Settings>) => void;
  addPlantOpen: boolean;
  setAddPlantOpen: (open: boolean) => void;
}

const GardenContext = createContext<GardenState | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

export function GardenProvider({ children }: { children: ReactNode }) {
  const [plants, setPlants] = useState<Plant[]>(seedPlants);
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [addPlantOpen, setAddPlantOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<{ plants: Plant[]; tasks: Task[]; settings: Settings }>;
        if (saved.plants) setPlants(saved.plants);
        if (saved.tasks) setTasks(saved.tasks);
        if (saved.settings) setSettings({ ...defaultSettings, ...saved.settings });
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ plants, tasks, settings }));
  }, [plants, tasks, settings, hydrated]);

  const addPlant = useCallback((p: Omit<Plant, "id">) => {
    setPlants((prev) => [{ ...p, id: uid() }, ...prev]);
  }, []);

  const removePlant = useCallback((id: string) => {
    setPlants((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const waterPlant = useCallback(
    (id: string) => {
      const todayISO = toISO(getToday());
      const plant = plants.find((p) => p.id === id);
      if (!plant) return;
      const keyword = plant.name.split(" ")[0];
      setPlants((prev) => prev.map((p) => (p.id === id ? { ...p, lastWatered: todayISO } : p)));
      setTasks((prev) =>
        prev.map((t) =>
          t.type === "water" && !t.done && t.due <= todayISO && t.title.includes(keyword) ? { ...t, done: true } : t,
        ),
      );
    },
    [plants],
  );

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const addTask = useCallback((t: Omit<Task, "id" | "done">) => {
    setTasks((prev) => [...prev, { ...t, id: uid(), done: false }]);
  }, []);

  const updateSettings = useCallback((s: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...s }));
  }, []);

  const value = useMemo(
    () => ({
      plants,
      tasks,
      settings,
      addPlant,
      removePlant,
      waterPlant,
      toggleTask,
      addTask,
      updateSettings,
      addPlantOpen,
      setAddPlantOpen,
    }),
    [plants, tasks, settings, addPlant, removePlant, waterPlant, toggleTask, addTask, updateSettings, addPlantOpen],
  );

  return <GardenContext.Provider value={value}>{children}</GardenContext.Provider>;
}

export function useGarden() {
  const ctx = useContext(GardenContext);
  if (!ctx) throw new Error("useGarden must be used inside GardenProvider");
  return ctx;
}
