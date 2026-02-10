import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthFacade } from './auth.facade';

export const authGuard: CanMatchFn = () => {
  const auth = inject(AuthFacade);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.parseUrl('/login');
};