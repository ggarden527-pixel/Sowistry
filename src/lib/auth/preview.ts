import { AuthUnavailableError, type AuthBackend, type AuthUser } from "./types";

const SESSION_KEY = "sowistry:preview-session";
const DEVICE_ID_KEY = "sowistry:preview-id";
const listeners = new Set<(user: AuthUser | null) => void>();

function read(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function emit(user: AuthUser | null) {
  listeners.forEach((cb) => cb(user));
}

function deviceId() {
  let id = window.localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `preview-${crypto.randomUUID()}`;
    window.localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

const unavailable = async (): Promise<never> => {
  throw new AuthUnavailableError();
};

/** Device-only session so the private dashboard can be explored before real accounts exist. */
export const previewAuth: AuthBackend = {
  kind: "preview",
  getUser: async () => read(),
  onChange(cb) {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) cb(read());
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  },
  signInWithPassword: unavailable,
  signUp: unavailable,
  signInWithOAuth: unavailable,
  sendPasswordReset: unavailable,
  updatePassword: unavailable,
  async signOut() {
    window.localStorage.removeItem(SESSION_KEY);
    emit(null);
  },
  async startPreviewSession(name: string) {
    const user: AuthUser = { id: deviceId(), email: "", name: name.trim() || "Gardener", avatarUrl: null };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    emit(user);
  },
};
