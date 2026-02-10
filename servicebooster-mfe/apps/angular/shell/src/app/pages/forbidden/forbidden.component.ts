import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forbidden.component.html',
})
export class ForbiddenComponent {
  constructor(private router: Router) {}
  back() {
    this.router.navigateByUrl('/select-app');
  }
}