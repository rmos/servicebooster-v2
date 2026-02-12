import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthFacade } from '../../core/auth/auth.facade';
import { ALL_MFE_APPS } from '../../core/mfe/mfe.registry';
import { setLegacySession } from '../../core/legacy/legacy-sso.bridge';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-app.component.html',
})
export class SelectAppComponent {

  mfMode = new URLSearchParams(location.search).get('mf') ?? 'none';

  constructor(public auth: AuthFacade, private router: Router) {}

  get apps() {
    const u = (this as any).auth['userSubject']?.value; // si prefieres, expón un getter en facade
    const permissions = u?.permissions ?? [];
    return ALL_MFE_APPS.filter((a) => permissions.includes(a.permission));
  }

  open(route: string) {
    alert('OPEN ' + route);
    this.router.navigateByUrl(route);
  }

  openLegacy() {
    alert('OPEN LEGACY');
    const token = this.auth.getToken();
    const credential = this.auth.getCredential();

    if (!token || !credential) {
      // si quieres, redirige a login o muestra mensaje
      return;
    }

    setLegacySession({
      token,
      credential,
      env: this.auth.getEnv?.() ?? null,
    });

    // navegación dura (legacy tiene su index)
    window.location.assign('/legacy/');
  }
  
}