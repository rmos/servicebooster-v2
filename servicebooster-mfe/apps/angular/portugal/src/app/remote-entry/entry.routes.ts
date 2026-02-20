import { Route } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { mockInterceptor } from '../core/mocks/mock.interceptor';
import { authInterceptor } from '../core/auth/auth.interceptor';
import { PaquetesService } from './features/paquetes/services/paquetes.service';

export const remoteRoutes: Route[] = [
  {
    path: '',
    providers: [
        PaquetesService,
        provideHttpClient(withInterceptors([mockInterceptor, authInterceptor])),
    ],
    children: [
      // redirección por defecto
      { path: '', redirectTo: 'paquetes', pathMatch: 'full' },

      // páginas del remoto
      {
        path: 'paquetes',
        loadComponent: () =>
          import('./features/paquetes/paquetes.page').then(m => m.PaquetesPage),
      },
    ],
  },
];