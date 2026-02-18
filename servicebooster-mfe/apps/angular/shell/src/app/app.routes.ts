import { Route } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { permissionGuard } from './core/auth/permission.guard';
import { EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';

type RemoteName = 'legacy' | 'portugal' | 'ireland';
 
function loadRemoteRoutes(remote: RemoteName) {
  return () => {
    console.log('[ROUTER] trying remote', remote);
 
    const envInjector = inject(EnvironmentInjector);
 
    return runInInjectionContext(envInjector, async () => {
      console.log('[ROUTER] in injection context for', remote);
 
      try {
        const m = await (window as any).mfLoadRoutes(remote);
        console.log('[ROUTER] remote module loaded for', remote, m);
 
        const routes = m?.remoteRoutes ?? m?.routes ?? m?.default;
        console.log('[ROUTER] routes resolved for', remote, routes);
 
        if (!routes) throw new Error('No routes export');
        return routes as Route[];
      } catch (err) {
        console.error('[ROUTER] Failed to load remote routes:', remote, err);
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
      }
    });
  };
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
