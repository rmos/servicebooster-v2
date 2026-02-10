import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthFacade } from './auth.facade';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthFacade);

  const token = auth.getToken();
  const credential = auth.getCredential();

  // No tocar llamadas sin token
  if (!token) return next(req);

  // Opcional: evita meter auth en assets/manifests
  if (req.url.includes('module-federation.manifest')) return next(req);
  if (req.url.endsWith('.json') && req.url.includes('/assets/')) return next(req);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  // Si tu backend usa también "credential" (tu payload lo trae)
  if (credential) {
    headers['X-Credential'] = credential;
  }

  return next(req.clone({ setHeaders: headers }));
};