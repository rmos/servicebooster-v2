import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('x-auth-token');
  const credential = localStorage.getItem('x-credential');

  let headers = req.headers;
  if (token) headers = headers.set('x-auth-token', token);
  if (credential) headers = headers.set('x-credential', credential);

  return next(req.clone({ headers }));
};