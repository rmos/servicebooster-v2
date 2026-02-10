import type { SessionUser } from './types';

export interface ShellSessionBridge {
  getToken(): string | null;
  getCredential(): string | null;
  getUser(): SessionUser | null;
  isLoggedIn(): boolean;
  has(permission: string): boolean;
  subscribe(cb: () => void): () => void;
}

export function getShellSession(): ShellSessionBridge | null {
  return (window as any).__SB_SESSION__ ?? null;
}