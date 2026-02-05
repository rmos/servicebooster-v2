import { NxWelcome } from './nx-welcome';
import { Route } from '@angular/router';
import { loadRemote } from '@module-federation/enhanced/runtime';

export const appRoutes: Route[] = [
  {
    path: 'legacy',
    loadChildren: () =>
      loadRemote<typeof import('legacy/Routes')>('legacy/Routes').then(
        (m) => m!.remoteRoutes,
      ),
  },
  {
    path: 'portugal',
    loadChildren: () =>
      loadRemote<typeof import('portugal/Routes')>('portugal/Routes').then(
        (m) => m!.remoteRoutes,
      ),
  },
  {
    path: 'ireland',
    loadChildren: () =>
      loadRemote<typeof import('ireland/Routes')>('ireland/Routes').then(
        (m) => m!.remoteRoutes,
      ),
  },
  {
    path: '',
    component: NxWelcome,
  },
];
