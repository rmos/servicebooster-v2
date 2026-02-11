import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthFacade } from '../core/auth/auth.facade';

@Component({
  standalone: true,
  selector: 'sb-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent {
  constructor(public auth: AuthFacade) {}

  get user() {
    return this.auth.currentUser;
  }

  logout() {
    this.auth.logout();
  }
}