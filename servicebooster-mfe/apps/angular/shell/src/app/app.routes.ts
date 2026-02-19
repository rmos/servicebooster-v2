import { Route } from '@angular/router';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { authGuard } from './core/auth/auth.guard';
import { permissionGuard } from './core/auth/permission.guard';

type RemoteName = 'legacy' | 'portugal' | 'ireland';

function loadRemoteRoutes(remote: RemoteName) {
  return () =>
    loadRemote<any>(`${remote}/Routes`)
      .then((m) => {
        const routes = m?.remoteRoutes ?? m?.routes ?? m?.default;
        if (!routes) {
          throw new Error(
            `Remote ${remote} loaded but did not export routes (remoteRoutes/routes/default)`
          );
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
  // Público
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },

  // Privado: todo bajo layout
  {
    path: '',
    canMatch: [authGuard],
    loadComponent: () => import('./layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      // Pantallas privadas
      {
        path: 'select-app',
        loadComponent: () =>
          import('./pages/select-app/select-app.component').then((m) => m.SelectAppComponent),
      },
      {
        path: 'forbidden',
        loadComponent: () =>
          import('./pages/forbidden/forbidden.component').then((m) => m.ForbiddenComponent),
      },

      // Remotes protegidos por permiso
      {
        path: 'legacy',
        canMatch: [permissionGuard('ACCESS-AMBAR')],
        loadChildren: loadRemoteRoutes('legacy'),
      },
      {
        path: 'portugal',
        // TODO: cambia esto al permiso real, por ejemplo 'ACCESS-PRE'
        canMatch: [permissionGuard('ACCESS-AMBAR')],
        loadChildren: loadRemoteRoutes('portugal'),
      },
      {
        path: 'ireland',
        canMatch: [permissionGuard('ACCESS-V1')],
        loadChildren: loadRemoteRoutes('ireland'),
      },

      // Default privado
      { path: '', pathMatch: 'full', redirectTo: 'select-app' },

      // Wildcard privado
      { path: '**', redirectTo: 'select-app' },
    ],
  },

  // Wildcard global
  { path: '**', redirectTo: 'login' },
];
