import { SessionUser } from './auth.models';

export interface ShellSessionBridge {
  getToken(): string | null;
  getUser(): SessionUser | null;
  isLoggedIn(): boolean;
  has(permission: string): boolean;
  subscribe(cb: () => void): () => void;
}