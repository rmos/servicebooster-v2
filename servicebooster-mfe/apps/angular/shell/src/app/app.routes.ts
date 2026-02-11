import { Route, Router } from '@angular/router';
import { NxWelcome } from './nx-welcome';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { authGuard } from './core/auth/auth.guard';
import { permissionGuard } from './core/auth/permission.guard';
import { AuthFacade } from './core/auth/auth.facade';
import { inject } from '@angular/core';

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
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'select-app',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./pages/select-app/select-app.component').then((m) => m.SelectAppComponent),
  },
  {
    path: 'forbidden',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./pages/forbidden/forbidden.component').then((m) => m.ForbiddenComponent),
  },

  {
    path: 'legacy',
    canMatch: [permissionGuard('ACCESS-AMBAR')],
    loadChildren: loadRemoteRoutes('legacy'),
  },
  {
    path: 'portugal',
    canMatch: [permissionGuard('ACCESS-NULL')],
    loadChildren: loadRemoteRoutes('portugal'),
  },
  {
    path: 'ireland',
    canMatch: [permissionGuard('ACCESS-V1')],
    loadChildren: loadRemoteRoutes('ireland'),
  },

  // Home: decide segun sesion
  {
    path: '',
    pathMatch: 'full',
    canMatch: [
      () => {
        const auth = inject(AuthFacade);
        const router = inject(Router);
        return auth.isLoggedIn() ? router.parseUrl('/select-app') : router.parseUrl('/login');
      },
    ],
    component: NxWelcome, // no se usara por el redirect, pero Angular pide algo
  },

  { path: '**', redirectTo: '' },
];
