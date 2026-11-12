export type OAuthProvider = "google" | "apple";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface SignUpResult {
  /** True when the account exists but the user must click the link in their email first. */
  needsEmailConfirmation: boolean;
}

/**
 * Everything the app needs from an identity provider. Pages and the route gate only talk to this
 * interface, so swapping the preview backend for Supabase touches one file (src/lib/auth/index.ts).
 */
export interface AuthBackend {
  /** "preview" is a device-only stand-in used until the Supabase project is connected. */
  readonly kind: "preview" | "supabase";
  getUser(): Promise<AuthUser | null>;
  onChange(cb: (user: AuthUser | null) => void): () => void;
  signInWithPassword(email: string, password: string): Promise<void>;
  signUp(input: { email: string; password: string; name: string }): Promise<SignUpResult>;
  signInWithOAuth(provider: OAuthProvider, returnTo: string): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  signOut(): Promise<void>;
  /** Preview backend only: start a device-local session so the dashboard can be explored. */
  startPreviewSession?: (name: string) => Promise<void>;
}

export class AuthUnavailableError extends Error {
  constructor() {
    super("Accounts switch on once Sowistry's database is connected. Use preview mode for now.");
    this.name = "AuthUnavailableError";
  }
}
