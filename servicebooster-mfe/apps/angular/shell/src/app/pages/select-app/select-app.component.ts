import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthFacade } from '../../core/auth/auth.facade';
import { ALL_MFE_APPS } from '../../core/mfe/mfe.registry';

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
    this.router.navigateByUrl(route);
  }
}