import { Route } from '@angular/router';

export const remoteRoutes: Route[] = [
    
    {
        path: '',
        redirectTo: 'paquetes',
        pathMatch: 'full'
    },

    {
        path: 'paquetes',
        loadComponent: () =>
        import('./features/paquetes/paquetes.page').then(m => m.PaquetesPage),
    }
];