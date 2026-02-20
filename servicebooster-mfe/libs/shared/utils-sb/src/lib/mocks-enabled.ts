// libs/shared/utils/src/lib/mocks-enabled.ts
export interface MocksOptions {
  /**
   * Valor por defecto de environment.useMocks
   */
  default?: boolean;

  /**
   * Nombre del query param que activa mocks, p.ej. ?mocks=1
   */
  param?: string;

  /**
   * Clave de localStorage para activar mocks (p.ej. 'useMocks')
   */
  storageKey?: string;

  /**
   * Flag global en window para activar mocks (p.ej. window.__USE_MOCKS__)
   */
  windowFlag?: string;
}

/**
 * Determina si el modo mocks está activo.
 * Prioridad:
 *   1) Query param (?mocks=1|true)
 *   2) localStorage ('useMocks' por defecto)
 *   3) window.__USE_MOCKS__ (o el flag que indiques)
 *   4) default (normalmente environment.useMocks)
 */
export function mocksEnabled(opts?: MocksOptions): boolean {
  const def = opts?.default ?? false;
  const param = opts?.param ?? 'mocks';
  const storageKey = opts?.storageKey ?? 'useMocks';
  const windowFlag = opts?.windowFlag ?? '__USE_MOCKS__';

  try {
    // 1) Query param
    const qs = new URLSearchParams(window.location.search);
    const qp = (qs.get(param) || '').toLowerCase();
    if (qp === '1' || qp === 'true') return true;

    // 2) LocalStorage
    const ls = (localStorage.getItem(storageKey) || '').toLowerCase();
    if (ls === '1' || ls === 'true') return true;

    // 3) Flag global en window
    const wf: any = (window as any)[windowFlag];
    if (wf === true || wf === '1' || wf === 'true') return true;

    // 4) Por defecto (environment.useMocks)
    return def;
  } catch {
    return def;
  }
}