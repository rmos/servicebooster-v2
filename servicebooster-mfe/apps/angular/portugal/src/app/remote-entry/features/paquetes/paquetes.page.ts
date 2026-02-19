import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { UiAgGrid} from '@servicebooster-mfe/ui-ag-grid';
import { PaquetesService } from './services/paquetes.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, UiAgGrid],
  templateUrl: './paquetes.page.html',
  styleUrls: ['./paquetes.page.scss']
})
export class PaquetesPage {

  title = 'Paquetes';
  Math = Math; // permitir Math.* en template

  filtro = signal('');

  constructor(
    public svc: PaquetesService,
    private router: Router
  ) {
    this.svc.cargar();
  }

  // Columnas AG Grid
  columns: ColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      sortable: true,
      cellRenderer: (p: ICellRendererParams) =>
        `<a style="cursor:pointer; color:#0a5bd6; text-decoration:underline"
            data-id="${p.value}">
            ${p.value}
         </a>`
    },
    { field: 'build', headerName: 'Paquete' },
    { field: 'owner', headerName: 'Propietario' },
    {
      field: 'creationDate',
      headerName: 'Fecha creación',
      valueFormatter: p =>
        p.value ? new Date(p.value).toLocaleString() : ''
    },
    {
      field: 'environmentStatus',
      headerName: 'Despliegue',
      cellRenderer: (p: ICellRendererParams) => {
        const v = p.value ?? '';
        const color =
          v === 'undeployed' ? 'orange' :
          v === 'deployed' ? 'green' : 'red';

        return `
            <span style="
                padding:2px 6px;
                border-radius:4px;
                background:${color==='red'?'#ffdddd':
                           color==='orange'?'#fff4ce':
                           '#ddffdd'};
                color:${color};
                font-weight:500;">
                ${v}
            </span>
        `;
      }
    }
  ];

  // Datos de vista directamente desde el servicio
  rows = computed(() => this.svc.packages());
  total = computed(() => this.svc.total());
  pageSize = computed(() => this.svc.limit());
  pageIndex = computed(() => this.svc.offset() / this.svc.limit());

  // Paginación UI
  next() { this.svc.siguiente(); }
  prev() { this.svc.anterior(); }

  // Quick filter real
  onFiltro(v: string) {
    this.filtro.set(v);
    this.svc.buscarPorNombre(v);
  }

  crear() {
    console.log("Crear...")
  }
}