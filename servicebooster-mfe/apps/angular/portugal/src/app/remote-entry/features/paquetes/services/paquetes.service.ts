import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PaquetesService {

  packages = signal<any[]>([]);
  total = signal(0);

  loading = signal(false);

  // Parámetros del grid
  limit = signal(10);
  offset = signal(0);
  nameFilter = signal('');

  constructor(private http: HttpClient) {}

  cargar() {
    this.loading.set(true);

    let params = new HttpParams()
      .set('draw', '1')
      .set('limit', this.limit())
      .set('offset', this.offset())
      .set('name', this.nameFilter() || '')
      .set('env', '')
      .set('status', '')
      .set('type', '');

    this.http.get<any>('/api/packages/my-packages/1000/list/ambar', { params })
      .subscribe({
        next: (res) => {
          this.packages.set(res.data);
          this.total.set(res.recordsTotal);
        },
        error: (err) => {
          console.error('Error cargando paquetes', err);
        },
        complete: () => this.loading.set(false)
      });
  }

  // Cambiar página
  siguiente() {
    if (this.offset() + this.limit() < this.total())
      this.offset.update(o => o + this.limit());
    this.cargar();
  }

  anterior() {
    if (this.offset() > 0)
      this.offset.update(o => o - this.limit());
    this.cargar();
  }

  buscarPorNombre(nombre: string) {
    this.nameFilter.set(nombre);
    this.offset.set(0);
    this.cargar();
  }

  // Obtener detalle
  detalle(id: number) {
    return this.http.get<any>(
      `/api/packages/my-packages/1000/${id}/detail`
    );
  }
}