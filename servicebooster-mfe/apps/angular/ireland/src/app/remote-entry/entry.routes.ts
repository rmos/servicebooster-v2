import { Route } from '@angular/router';
 
export const remoteRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./entry').then((m) => m.RemoteEntry),
  },
];
