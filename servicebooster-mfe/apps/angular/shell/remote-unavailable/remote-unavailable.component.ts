import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-remote-unavailable',
  template: `
    <div style="padding: 24px;">
      <h2>Microfrontend no disponible</h2>
      <p>
        No se ha podido cargar: <strong>{{ remote }}</strong>
      </p>
      <p>Prueba a recargar o vuelve más tarde.</p>
      <button (click)="reload()">Recargar</button>
    </div>
  `,
})
export class RemoteUnavailableComponent {
  remote = this.route.snapshot.data['remote'] ?? 'desconocido';

  constructor(private route: ActivatedRoute) {}

  reload() {
    location.reload();
  }
}