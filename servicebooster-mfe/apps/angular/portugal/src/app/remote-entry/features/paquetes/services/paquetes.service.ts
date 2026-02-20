import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UiAgGridQuery, UiAgGridSort } from '@servicebooster-mfe/ui-ag-grid';

@Injectable({ providedIn: 'root' })
export class PaquetesService {

  packages = signal<any[]>([]);
  total = signal(0);

  loading = signal(false);

  // Parámetros del grid
  limit = signal(10);
  offset = signal(0);
  nameFilter = signal('');
  sorts = signal<UiAgGridSort[]>([]);

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

  actualizarQuery(query: UiAgGridQuery) {
    const nextOffset = query.pageIndex * query.pageSize;
    const hasChanges =
      this.limit() !== query.pageSize ||
      this.offset() !== nextOffset ||
      this.nameFilter() !== query.search ||
      JSON.stringify(this.sorts()) !== JSON.stringify(query.sorts);

    if (!hasChanges) return;

    this.limit.set(query.pageSize);
    this.offset.set(nextOffset);
    this.nameFilter.set(query.search);
    this.sorts.set(query.sorts);
    this.cargar();
  }

  recargar() {
    this.cargar();
  }

  // Obtener detalle
  detalle(id: number) {
    return this.http.get<any>(
      `/api/packages/my-packages/1000/${id}/detail`
    );
  }
}
