import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import {
  UiAgGrid,
  UiAgGridActionClick,
  UiAgGridQuery,
  UiAgGridRowAction,
} from '@servicebooster-mfe/ui-ag-grid';
import { PaquetesService } from './services/paquetes.service';

@Component({
  standalone: true,
  imports: [CommonModule, UiAgGrid],
  templateUrl: './paquetes.page.html',
  styleUrls: ['./paquetes.page.scss']
})
export class PaquetesPage {

  title = 'Paquetes';

  constructor(
    public svc: PaquetesService
  ) {
    this.svc.recargar();
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
    },
  ];

  rowActions: UiAgGridRowAction[] = [
    {
      id: 'deploy',
      label: 'Desplegar',
      icon: '🚀',
      cssClass: 'sb-accent',
      visible: (row) => row?.environmentStatus !== 'deployed',
    },
    {
      id: 'promote',
      label: 'Promocionar',
      icon: '☁️⬆️',
      enabled: (row) => row?.environmentStatus === 'deployed',
    },
    {
      id: 'cancel',
      label: 'Cancelar',
      icon: '✖',
      cssClass: 'sb-danger',
      enabled: (row) => row?.environmentStatus !== 'deployed',
    },
  ];

  // Datos de vista directamente desde el servicio
  rows = computed(() => this.svc.packages());
  total = computed(() => this.svc.total());

  onGridQueryChange(query: UiAgGridQuery) {
    this.svc.actualizarQuery(query);
  }

  onGridActionClick(event: UiAgGridActionClick) {
    const rowId = event.row?.id;
    if (!rowId) return;

    switch (event.actionId) {
      case 'deploy':
        console.log('[PAQUETES] Deploy', rowId, event.row);
        break;
      case 'promote':
        console.log('[PAQUETES] Promote', rowId, event.row);
        break;
      case 'cancel':
        console.log('[PAQUETES] Cancel', rowId, event.row);
        break;
      default:
        break;
    }
  }

  crear() {
    console.log("Crear...")
  }

  refrescar() {
    this.svc.recargar();
  }
}
