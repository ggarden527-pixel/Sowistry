import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { useAuth } from "./auth/context";
import { seedPlants, seedTasks } from "./data";
import { getToday, toISO } from "./dates";
import type { Plant } from "./inventory";
import { gardenRepo, type Profile } from "./repo";
import type { Task } from "./tasks";

/** What the app shows and edits as "settings": the saved profile plus the account's name and email. */
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

export const defaultProfile = (displayName: string): Profile => ({
  displayName,
  avatarUrl: null,
  location: "",
  zone: "",
  units: "imperial",
  notifyWatering: true,
  notifyPlanting: true,
  weeklyDigest: false,
});

interface GardenState {
  /** True once the signed-in user's garden has loaded. */
  ready: boolean;
  plants: Plant[];
  tasks: Task[];
  settings: Settings;
  addPlant: (p: Omit<Plant, "id">) => void;
  removePlant: (id: string) => void;
  waterPlant: (id: string) => void;
  toggleTask: (id: string) => void;
  addTask: (t: Omit<Task, "id" | "done">) => void;
  updateSettings: (s: Partial<Settings>) => void;
  loadSampleGarden: () => void;
  addPlantOpen: boolean;
  setAddPlantOpen: (open: boolean) => void;
}

const GardenContext = createContext<GardenState | null>(null);

const newId = () => crypto.randomUUID();

export function GardenProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [plants, setPlants] = useState<Plant[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [addPlantOpen, setAddPlantOpen] = useState(false);

  // Latest state for callbacks that read before writing (avoids stale closures).
  const latest = useRef({ plants, tasks });
  latest.current = { plants, tasks };

  useEffect(() => {
    setPlants([]);
    setTasks([]);
    setProfile(null);
    setLoadedFor(null);
    if (!userId) return;
    let alive = true;
    gardenRepo
      .load(userId)
      .then((g) => {
        if (!alive) return;
        setPlants(g.plants);
        setTasks(g.tasks);
        setProfile(g.profile);
        setLoadedFor(userId);
      })
      .catch(() => alive && toast.error("We couldn't load your garden. Please refresh."));
    return () => {
      alive = false;
    };
  }, [userId]);

  const persist = useCallback((p: Promise<void>) => {
    p.catch(() => toast.error("That change didn't save. Please try again."));
  }, []);

  const addPlant = useCallback(
    (p: Omit<Plant, "id">) => {
      if (!userId) return;
      const plant = { ...p, id: newId() };
      setPlants((prev) => [plant, ...prev]);
      persist(gardenRepo.savePlants(userId, [plant]));
    },
    [userId, persist],
  );

  const removePlant = useCallback(
    (id: string) => {
      if (!userId) return;
      setPlants((prev) => prev.filter((p) => p.id !== id));
      persist(gardenRepo.deletePlant(userId, id));
    },
    [userId, persist],
  );

  const waterPlant = useCallback(
    (id: string) => {
      if (!userId) return;
      const todayISO = toISO(getToday());
      const plant = latest.current.plants.find((p) => p.id === id);
      if (!plant) return;
      const keyword = plant.name.split(" ")[0] ?? plant.name;
      const watered = { ...plant, lastWatered: todayISO };
      const closed = latest.current.tasks
        .filter((t) => t.type === "water" && !t.done && t.due <= todayISO && (t.plantId === id || t.title.includes(keyword)))
        .map((t) => ({ ...t, done: true }));
      setPlants((prev) => prev.map((p) => (p.id === id ? watered : p)));
      if (closed.length) {
        const ids = new Set(closed.map((t) => t.id));
        setTasks((prev) => prev.map((t) => (ids.has(t.id) ? { ...t, done: true } : t)));
        persist(gardenRepo.saveTasks(userId, closed));
      }
      persist(gardenRepo.savePlants(userId, [watered]));
    },
    [userId, persist],
  );

  const toggleTask = useCallback(
    (id: string) => {
      if (!userId) return;
      const task = latest.current.tasks.find((t) => t.id === id);
      if (!task) return;
      const next = { ...task, done: !task.done };
      setTasks((prev) => prev.map((t) => (t.id === id ? next : t)));
      persist(gardenRepo.saveTasks(userId, [next]));
    },
    [userId, persist],
  );

  const addTask = useCallback(
    (t: Omit<Task, "id" | "done">) => {
      if (!userId) return;
      const task = { ...t, id: newId(), done: false };
      setTasks((prev) => [...prev, task]);
      persist(gardenRepo.saveTasks(userId, [task]));
    },
    [userId, persist],
  );

  const baseProfile = useMemo(() => profile ?? defaultProfile(user?.name ?? ""), [profile, user?.name]);

  const updateSettings = useCallback(
    (s: Partial<Settings>) => {
      if (!userId) return;
      const { name, email: _email, ...rest } = s;
      const next: Profile = { ...baseProfile, ...rest, ...(name !== undefined ? { displayName: name } : {}) };
      setProfile(next);
      persist(gardenRepo.saveProfile(userId, next));
    },
    [userId, baseProfile, persist],
  );

  const loadSampleGarden = useCallback(() => {
    if (!userId) return;
    const samplePlants = seedPlants().map((p) => ({ ...p, id: newId() }));
    const sampleTasks = seedTasks().map((t) => ({ ...t, id: newId() }));
    setPlants((prev) => [...samplePlants, ...prev]);
    setTasks((prev) => [...prev, ...sampleTasks]);
    persist(gardenRepo.savePlants(userId, samplePlants));
    persist(gardenRepo.saveTasks(userId, sampleTasks));
  }, [userId, persist]);

  const settings: Settings = useMemo(
    () => ({
      name: baseProfile.displayName || user?.name || "",
      email: user?.email ?? "",
      location: baseProfile.location,
      zone: baseProfile.zone,
      units: baseProfile.units,
      notifyWatering: baseProfile.notifyWatering,
      notifyPlanting: baseProfile.notifyPlanting,
      weeklyDigest: baseProfile.weeklyDigest,
    }),
    [baseProfile, user?.name, user?.email],
  );

  const value = useMemo(
    () => ({
      ready: !!userId && loadedFor === userId,
      plants,
      tasks,
      settings,
      addPlant,
      removePlant,
      waterPlant,
      toggleTask,
      addTask,
      updateSettings,
      loadSampleGarden,
      addPlantOpen,
      setAddPlantOpen,
    }),
    [userId, loadedFor, plants, tasks, settings, addPlant, removePlant, waterPlant, toggleTask, addTask, updateSettings, loadSampleGarden, addPlantOpen],
  );

  return <GardenContext.Provider value={value}>{children}</GardenContext.Provider>;
}

export function useGarden() {
  const ctx = useContext(GardenContext);
  if (!ctx) throw new Error("useGarden must be used inside GardenProvider");
  return ctx;
}
