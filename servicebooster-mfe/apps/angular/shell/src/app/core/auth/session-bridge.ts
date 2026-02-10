import { AuthFacade } from './auth.facade';
import { ShellSessionBridge } from './session-bridge.types';

const listeners = new Set<() => void>();

function notify() {
  for (const cb of listeners) cb();
}

export function installSessionBridge(auth: AuthFacade) {
  const bridge: ShellSessionBridge = {
    getToken: () => auth.getToken(),
    getUser: () => auth.currentUser,
    isLoggedIn: () => auth.isLoggedIn(),
    has: (p) => auth.has(p),
    subscribe: (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  };

  (window as any).__SB_SESSION__ = bridge;

  // cuando cambie user$, avisamos a los remotes
  auth.user$.subscribe(() => notify());
}