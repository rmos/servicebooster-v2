import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApi } from '../../core/auth/auth.api';
import { AuthFacade } from '../../core/auth/auth.facade';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error: string | null = null;

  constructor(private api: AuthApi, private auth: AuthFacade, private router: Router) {}

  submit() {
    this.error = null;
    this.loading = true;

    this.api.login(this.username, this.password).subscribe({
      next: (resp) => {
        this.auth.setSession(resp);
        this.router.navigateByUrl('/select-app');
      },
      error: () => {
        this.error = 'Credenciales inválidas o error de conexión';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}