import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthFacade } from './auth.facade';

export function permissionGuard(permission: string): CanMatchFn {
  return () => {
    const auth = inject(AuthFacade);
    const router = inject(Router);

    if (!auth.isLoggedIn()) return router.parseUrl('/login');
    if (!auth.has(permission)) return router.parseUrl('/forbidden');

    return true;
  };
}