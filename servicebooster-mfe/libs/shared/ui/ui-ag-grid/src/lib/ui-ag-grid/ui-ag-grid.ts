import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ModuleRegistry,
  AllCommunityModule,
  ColDef,
  RowSelectionOptions,
  themeQuartz,
  GridApi,
  GridReadyEvent
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'lib-ui-ag-grid',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './ui-ag-grid.html',
  styles: [`
    :host { display:block; width:100%; }
  `],
})
export class UiAgGrid {

  /* Inputs */
  @Input() height = 450;
  @Input() columnDefs: ColDef[] = [];
  @Input() rowData: any[] = [];

  /* Quick filter text */
  @Input() quickFilter = '';

  /* AG Grid core */
  gridApi!: GridApi;

  theme = themeQuartz;

  rowSelection: RowSelectionOptions = {
    mode: 'singleRow',
    enableClickSelection: true,
  };

  gridOptions = {
    animateRows: true,
  };

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.resizeColumns();
    if (this.quickFilter) {
      this.gridApi.setGridOption('quickFilterText', this.quickFilter);
    }
  }

  ngOnChanges() {
    // si cambia el filtro
    if (this.gridApi && this.quickFilter !== undefined) {
      this.gridApi.setGridOption('quickFilterText', this.quickFilter);
    }
  }

  resizeColumns() {
    if (this.gridApi) {
      this.gridApi.sizeColumnsToFit();
    }
  }
}