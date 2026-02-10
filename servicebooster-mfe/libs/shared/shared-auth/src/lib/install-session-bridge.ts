import type { SessionUser } from './types';

export interface AuthFacadeLike {
  getToken(): string | null;
  getCredential(): string | null;
  isLoggedIn(): boolean;
  has(permission: string): boolean;
  currentUser: SessionUser | null;
  user$: { subscribe: (cb: () => void) => any };
}

const listeners = new Set<() => void>();
function notify() {
  for (const cb of listeners) cb();
}

export function installSessionBridge(auth: AuthFacadeLike) {
  (window as any).__SB_SESSION__ = {
    getToken: () => auth.getToken(),
    getCredential: () => auth.getCredential(),
    getUser: () => auth.currentUser,
    isLoggedIn: () => auth.isLoggedIn(),
    has: (p: string) => auth.has(p),
    subscribe: (cb: () => void) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  };

  auth.user$.subscribe(() => notify());
}