import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/auth/auth.interceptor';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { mockLoginInterceptor } from './core/mocks/mock-login.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), 
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([
      mockLoginInterceptor,
      authInterceptor
    ]))],
};
