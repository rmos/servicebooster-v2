import {
  HttpInterceptorFn,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { from, map, of, switchMap, delay, catchError, tap } from 'rxjs';

import { mocksEnabled } from '@servicebooster-mfe/shared-utils';

const PORTUGAL_DEV_ORIGIN = 'http://localhost:4202';

function readJson<T = any>(relativePath: string) {
  const url = `${PORTUGAL_DEV_ORIGIN}/${relativePath.replace(/^\/+/, '')}`;
  return from(fetch(url, { cache: 'no-store' }).then(r => r.json() as Promise<T>));
}

export const mockInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  console.debug('[PT][MOCK] intercept ->', req.method, req.url);
  
  
  const useMocks = mocksEnabled({ default: environment.useMocks });
  if (!useMocks) return next(req);


  // LOG (útil para verificar que intercepta)
  console.debug('[MOCK] Interceptando:', req.method, req.url);

  const url = req.url;

  // LISTA: GET /api/packages/my-packages/1000/list/ambar
  if (url.includes('/api/packages/my-packages/1000/list/ambar') && req.method === 'GET') {
    const limit = Number(req.params.get('limit') || 10);
    const offset = Number(req.params.get('offset') || 0);
    const name = (req.params.get('name') || '').toLowerCase().trim();

    return readJson<any>('mocks/packages/list.json').pipe(
      map((json) => {
        let items = (json?.data ?? []) as any[];

        if (name) {
          items = items.filter((it) => (it.name || '').toLowerCase().includes(name));
        }

        const total = items.length;
        const page = items.slice(offset, offset + limit);

        const body = {
          draw: '1',
          data: page,
          recordsTotal: total,
          recordsFiltered: total,
        };

        return new HttpResponse({ status: 200, body });
      }),
      delay(120)
    );
  }

  // DETALLE: GET /api/packages/my-packages/1000/:id/detail
  const m = url.match(/\/api\/packages\/my-packages\/1000\/(\d+)\/detail$/);
  if (m && req.method === 'GET') {
    const id = m[1];
    const path = `mocks/packages/detail_${id}.json`;

    return readJson<any>(path).pipe(
      map((body) => new HttpResponse({ status: 200, body })),
      delay(100),
      catchError(() => of(new HttpResponse({ status: 404 })))
    );
  }

  // Cualquier otra request sigue su camino normal
  return next(req);
};