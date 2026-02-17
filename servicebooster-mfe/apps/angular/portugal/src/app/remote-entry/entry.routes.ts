export const remoteRoutes = [
  { path: '', loadComponent: () => import('./entry').then(m => m.PortugalEntryComponent) },
];