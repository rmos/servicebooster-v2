import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { decodeJwt } from './jwt.util';
import { JwtClaims, LoginResponse, SessionUser } from './auth.models';

const LS_TOKEN = 'jwt';
const LS_CREDENTIAL = 'credential';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private userSubject = new BehaviorSubject<SessionUser | null>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    // Restaurar sesión si hay token al arrancar
    const token = this.getToken();
    if (token) this.hydrateFromToken(token);
  }

  setSession(resp: LoginResponse) {
    if (resp?.token) {
      localStorage.setItem(LS_TOKEN, resp.token);
      this.hydrateFromToken(resp.token);
    }
    if (resp?.credential) {
      localStorage.setItem(LS_CREDENTIAL, resp.credential);
    }
  }

  logout() {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_CREDENTIAL);
  
    sessionStorage.removeItem('ngStorage-jwt');
    sessionStorage.removeItem('ngStorage-credential');
    sessionStorage.removeItem('ngStorage-env');
    sessionStorage.removeItem('jwt');
    sessionStorage.removeItem('credential');
    sessionStorage.removeItem('env');
  
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(LS_TOKEN);
  }

  getCredential(): string | null {
    return localStorage.getItem(LS_CREDENTIAL);
  }

  getEnv(): { id: string | number } | null {
    const raw = localStorage.getItem('sb_env');
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    const u = this.userSubject.value;
    if (!u) return false;
    // margen de seguridad de 30s
    return u.exp * 1000 > Date.now() + 30_000;
  }

  has(permission: string): boolean {
    const u = this.userSubject.value;
    return !!u?.permissions?.includes(permission);
  }

  get currentUser() {
    return this.userSubject.value;
  }

  private hydrateFromToken(token: string) {
    const claims = decodeJwt<JwtClaims>(token);
    const user: SessionUser = {
      id: claims.id,
      userId: claims.user_id,
      name: claims.name,
      email: claims.email,
      permissions: Array.isArray(claims.permissions) ? claims.permissions : [],
      exp: claims.exp,
    };
    this.userSubject.next(user);
  }
}