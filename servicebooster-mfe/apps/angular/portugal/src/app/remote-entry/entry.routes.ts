import { Route } from '@angular/router';
import { RemoteEntry } from './entry';

export const remoteRoutes: Route[] = [
    { 
        path: '', component: RemoteEntry },
    {
        path: 'paquetes',
        loadComponent: () =>
        import('./features/paquetes/paquetes.page').then(m => m.PaquetesPage),
    }
];