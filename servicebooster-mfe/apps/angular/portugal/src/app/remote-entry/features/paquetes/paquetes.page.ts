import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { UiAgGrid } from '@servicebooster-mfe/ui-ag-grid';

interface Paquete {
  id: number;
  paquete: string;
  propietario: string;
  fecha: string;
  despliegue: string;
}

@Component({
  selector: 'app-paquetes-page',
  standalone: true,
  imports: [CommonModule, UiAgGrid],
  templateUrl: './paquetes.page.html',
  styleUrls: ['./paquetes.page.scss'],
})
export class PaquetesPage {

  title = 'Paquetes';

  /* Quick filter como signal */
  filtro = signal('');

  /* Columnas */
  columns: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'paquete', headerName: 'Paquete' },
    { field: 'propietario', headerName: 'Propietario' },
    { field: 'fecha', headerName: 'Fecha creación' },

    {
      field: 'despliegue',
      headerName: 'Despliegue',
      cellRenderer: (params: ICellRendererParams) => {
        const value = params.value ?? '';
        const color =
          value.includes('Error') ? 'red' :
          value.includes('No')   ? 'orange' :
                                   'green';

        return `
          <span style="
            padding:2px 6px;
            border-radius:4px;
            background:${color==='red'?'#ffdddd':
                       color==='orange'?'#fff4ce':
                                       '#ddffdd'};
            color:${color};
            font-weight:500;
          ">${value}</span>
        `;
      }
    }
  ];

  /* Datos */
  data = signal<Paquete[]>([
    {
      id: 24403,
      paquete: '1771321148746',
      propietario: 'test-bddin-userpromote',
      fecha: '17-02-2026 09:39:08',
      despliegue: 'Error despliegue en INT'
    }
  ]);

  rows = computed(() => this.data());

  refrescar() {
    console.log('TODO: refrescar desde API');
  }

  crear() {
    console.log('TODO: crear paquete');
  }

  setFiltro(texto: string) {
    this.filtro.set(texto);
  }
}