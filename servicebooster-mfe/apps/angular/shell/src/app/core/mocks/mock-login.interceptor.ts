import { HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { mocksEnabled } from '@servicebooster-mfe/shared-utils';

const LOGIN_PATHS = [
  '/api/users/login',
  '/api/auth/login',
  // '/api/login',
];

function isLoginRequest(req: HttpRequest<any>): boolean {
  const url = new URL(req.url, window.location.origin);
  const path = url.pathname.toLowerCase().replace(/\/+$/, '');

  return LOGIN_PATHS.includes(path);
}

export const mockLoginInterceptor: HttpInterceptorFn = (req, next) => {
  const useMocks = mocksEnabled({ default: environment.useMocks });

  console.log('[MOCK-LOGIN] useMocks =', useMocks);

  if (!useMocks) return next(req);

  if (!(req.method === 'POST' && isLoginRequest(req))) {
    return next(req);
  }

  console.log('[MOCK-LOGIN] INTERCEPTANDO LOGIN MOCK');

  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    user_id: 'SBADMIN',
    id: 1882,
    name: 'Admin User Test',
    email: 'mock@bankinter.com',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(new Date('2099-12-31T23:59:59Z').getTime() / 1000),
    user_type: 'app',
    permissions: ["ACCESS-PRO", "DEPLOY-FRONT-INT", "ACCESS-AMBAR", "ACCESS-V1", "ACCESS-PRE"]
  }));
  const signature = btoa('mock-signature');
  const token = `${header}.${payload}.${signature}`;

  const mockBody = {
    token: token,
    last_login_date: new Date().toISOString(),
    credential: 'MOCK-CREDENTIAL-12345',
    id: 1882
  };

  const res = new HttpResponse({
    status: 200,
    body: mockBody,
    url: req.url
  });

  return of(res).pipe(delay(150));
};