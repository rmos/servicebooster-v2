import { Route } from '@angular/router';
import { NxWelcome } from './nx-welcome';
import { loadRemote } from '@module-federation/enhanced/runtime';

type RemoteName = 'legacy' | 'portugal' | 'ireland';

function loadRemoteRoutes(remote: RemoteName) {
  return () =>
    loadRemote<any>(`${remote}/Routes`)
      .then((m) => {
        const routes = m?.remoteRoutes;
        if (!routes) {
          throw new Error(`Remote ${remote} loaded but did not export remoteRoutes`);
        }
        return routes as Route[];
      })
      .catch((err) => {
        console.error(`Failed to load remote routes: ${remote}`, err);

        return [
          {
            path: '',
            loadComponent: () =>
              import('../../remote-unavailable/remote-unavailable.component').then(
                (c) => c.RemoteUnavailableComponent
              ),
            data: { remote },
          },
        ] as Route[];
      });
}

export const appRoutes: Route[] = [
  {
    path: 'legacy',
    loadChildren: loadRemoteRoutes('legacy'),
  },
  {
    path: 'portugal',
    loadChildren: loadRemoteRoutes('portugal'),
  },
  {
    path: 'ireland',
    loadChildren: loadRemoteRoutes('ireland'),
  },

  // Home del shell
  {
    path: '',
    pathMatch: 'full',
    component: NxWelcome,
  },

  // Fallback global
  {
    path: '**',
    redirectTo: '',
  },
];
