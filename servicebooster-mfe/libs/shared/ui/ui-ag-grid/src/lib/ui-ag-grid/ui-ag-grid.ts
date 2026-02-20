import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  CellClickedEvent,
  ColDef,
  ICellRendererParams,
  AllCommunityModule,
  GridApi,
  GridReadyEvent,
  ModuleRegistry,
  RowHeightParams,
  RowSelectionOptions,
  themeQuartz,
} from 'ag-grid-community';
import {
  UiAgGridActionClick,
  UiAgGridExpandToggle,
  UiAgGridMode,
  UiAgGridQuery,
  UiAgGridRowAction,
  UiAgGridSort,
} from './ui-ag-grid.models';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'lib-ui-ag-grid',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './ui-ag-grid.html',
  styleUrls: ['./ui-ag-grid.css'],
})
export class UiAgGrid implements OnInit, OnChanges, OnDestroy {
  @Input() mode: UiAgGridMode = 'client';
  @Input() height = 450;
  @Input() columnDefs: ColDef[] = [];
  @Input() rowData: any[] = [];
  @Input() defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
  };
  @Input() loading = false;

  @Input() totalRows = 0;
  @Input() pageSizeOptions: number[] = [10, 25, 50];
  @Input() showSearch = true;
  @Input() searchPlaceholder = 'Buscar...';
  @Input() showPageSizeSelector = true;
  @Input() searchDebounceMs = 250;
  @Input() hybridRevalidateOnCacheHit = true;
  @Input() actionColumnHeader = 'Acciones';
  @Input() actionColumnWidth = 240;
  @Input() showActionLabels = false;
  @Input() rowActions: UiAgGridRowAction[] = [];
  @Input() enableRowExpand = true;
  @Input() defaultRowExpanded = false;
  @Input() expandedRowHeight = 148;
  @Input() showSelectionCheckbox = false;
  @Input() selectionMode: 'singleRow' | 'multiRow' = 'multiRow';
  @Input() rowIdField = 'id';
  @Input() detailFields: string[] = ['name', 'build', 'owner', 'creationDate', 'environmentStatus'];
  @Input() query: Partial<UiAgGridQuery> | null = null;

  @Output() sortChangedEvent = new EventEmitter<UiAgGridSort[]>();
  @Output() queryChange = new EventEmitter<UiAgGridQuery>();
  @Output() actionClick = new EventEmitter<UiAgGridActionClick>();
  @Output() rowExpandToggle = new EventEmitter<UiAgGridExpandToggle>();

  gridApi!: GridApi;
  theme = themeQuartz;
  rowSelection: RowSelectionOptions = {
    mode: 'multiRow',
    enableClickSelection: true,
    checkboxes: false,
    headerCheckbox: false,
  };
  gridOptions = {
    animateRows: true,
    getRowHeight: (params: RowHeightParams) => this.getRowHeightForNode(params),
  };

  renderedRows: any[] = [];
  resolvedColumnDefs: ColDef[] = [];

  currentQuery: UiAgGridQuery = {
    pageIndex: 0,
    pageSize: 10,
    search: '',
    sorts: [],
  };

  private searchDebounceHandle: ReturnType<typeof setTimeout> | undefined;
  private pageCache = new Map<string, any[]>();
  private lastRequestedQueryKey = '';
  private expandedRowIds = new Set<string>();

  ngOnInit() {
    this.initializePageSize();
    this.syncSelectionOptions();
    this.syncQueryFromInput(false);
    this.rebuildColumnDefs();
    this.syncExpandedRowsWithIncomingData();
    this.applyIncomingRowsToRendered();
    if (this.mode === 'server' || this.mode === 'hybrid') {
      this.requestDataForCurrentQuery();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['columnDefs'] || changes['rowActions'] || changes['actionColumnHeader'] || changes['actionColumnWidth'] || changes['enableRowExpand']) {
      this.rebuildColumnDefs();
    }
    if (changes['selectionMode'] || changes['showSelectionCheckbox']) {
      this.syncSelectionOptions();
    }
    if (changes['rowData']) {
      this.syncExpandedRowsWithIncomingData();
      this.applyIncomingRowsToRendered();
    }
    if (changes['query']) {
      this.syncQueryFromInput(false);
      this.syncClientQuickFilter();
      if (this.mode === 'hybrid') {
        this.applyHybridCacheForCurrentQuery();
      }
    }
    if (changes['mode']) {
      this.syncClientQuickFilter();
      if (this.mode === 'hybrid') {
        this.applyHybridCacheForCurrentQuery();
      }
    }
  }

  ngOnDestroy() {
    if (this.searchDebounceHandle) {
      clearTimeout(this.searchDebounceHandle);
    }
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.resizeColumns();
    this.syncClientQuickFilter();
    if (this.mode === 'client') {
      this.gridApi.setGridOption('paginationPageSize', this.currentQuery.pageSize);
    }
  }

  resizeColumns() {
    if (this.gridApi) {
      this.gridApi.sizeColumnsToFit();
    }
  }

  onSearchInput(value: string) {
    this.currentQuery = {
      ...this.currentQuery,
      search: value,
      pageIndex: 0,
    };

    this.syncClientQuickFilter();

    if (this.searchDebounceHandle) {
      clearTimeout(this.searchDebounceHandle);
    }

    this.searchDebounceHandle = setTimeout(() => this.requestDataForCurrentQuery(), this.searchDebounceMs);
  }

  onPageSizeChange(value: number) {
    this.currentQuery = {
      ...this.currentQuery,
      pageSize: value,
      pageIndex: 0,
    };

    if (this.mode === 'client' && this.gridApi) {
      this.gridApi.setGridOption('paginationPageSize', value);
    }

    this.requestDataForCurrentQuery();
  }

  onPrevPage() {
    if (this.currentQuery.pageIndex === 0) return;

    this.currentQuery = {
      ...this.currentQuery,
      pageIndex: this.currentQuery.pageIndex - 1,
    };

    this.requestDataForCurrentQuery();
  }

  onNextPage() {
    if (this.currentQuery.pageIndex + 1 >= this.totalPages) return;

    this.currentQuery = {
      ...this.currentQuery,
      pageIndex: this.currentQuery.pageIndex + 1,
    };

    this.requestDataForCurrentQuery();
  }

  onSortChanged() {
    if (!this.gridApi) return;

    const sortModel: UiAgGridSort[] = this.gridApi
      .getColumnState()
      .filter((col) => col.sort != null)
      .map((col) => ({
        colId: col.colId,
        sort: col.sort as 'asc' | 'desc',
        sortIndex: col.sortIndex,
      }));

    this.currentQuery = {
      ...this.currentQuery,
      sorts: sortModel,
      pageIndex: this.mode === 'server' || this.mode === 'hybrid' ? 0 : this.currentQuery.pageIndex,
    };

    this.sortChangedEvent.emit(sortModel);
    this.requestDataForCurrentQuery();
  }

  get totalPages(): number {
    if (this.mode === 'client') return 1;
    const pages = Math.ceil(this.totalRows / this.currentQuery.pageSize);
    return pages > 0 ? pages : 1;
  }

  get currentPage(): number {
    return this.currentQuery.pageIndex + 1;
  }

  private syncClientQuickFilter() {
    if (!this.gridApi || this.mode !== 'client') return;
    this.gridApi.setGridOption('quickFilterText', this.currentQuery.search);
  }

  private initializePageSize() {
    const firstPageSize = this.pageSizeOptions[0];
    if (!firstPageSize || firstPageSize <= 0) return;
    this.currentQuery = { ...this.currentQuery, pageSize: firstPageSize };
  }

  private syncQueryFromInput(emit: boolean) {
    if (!this.query) return;
    this.currentQuery = {
      pageIndex: this.query.pageIndex ?? this.currentQuery.pageIndex,
      pageSize: this.query.pageSize ?? this.currentQuery.pageSize,
      search: this.query.search ?? this.currentQuery.search,
      sorts: this.query.sorts ?? this.currentQuery.sorts,
    };
    if (emit) {
      this.emitQuery();
    }
  }

  onCellClicked(event: CellClickedEvent) {
    const shouldToggleExpand = this.extractExpandToggle(event.event?.target as HTMLElement | null);
    if (shouldToggleExpand && event.data) {
      this.toggleRowExpand(event.data);
      return;
    }

    const actionId = this.extractActionId(event.event?.target as HTMLElement | null);
    if (!actionId || !event.data) return;

    const action = this.rowActions.find((item) => item.id === actionId);
    if (!action) return;
    if (action.enabled && !action.enabled(event.data)) return;

    this.actionClick.emit({
      actionId,
      row: event.data,
    });
  }

  private requestDataForCurrentQuery() {
    if (this.mode === 'hybrid') {
      const hasCachedRows = this.applyHybridCacheForCurrentQuery();
      if (!hasCachedRows || this.hybridRevalidateOnCacheHit) {
        this.emitQuery();
      }
      return;
    }
    this.emitQuery();
  }

  private applyHybridCacheForCurrentQuery(): boolean {
    const cacheKey = this.buildQueryCacheKey(this.currentQuery);
    const cached = this.pageCache.get(cacheKey);
    if (!cached) return false;
    this.renderedRows = cached;
    return true;
  }

  private applyIncomingRowsToRendered() {
    this.renderedRows = this.rowData ?? [];

    if (this.mode === 'hybrid') {
      const cacheKey = this.lastRequestedQueryKey || this.buildQueryCacheKey(this.currentQuery);
      this.pageCache.set(cacheKey, [...this.renderedRows]);
    }
  }

  private emitQuery() {
    this.lastRequestedQueryKey = this.buildQueryCacheKey(this.currentQuery);
    this.queryChange.emit({ ...this.currentQuery });
  }

  private rebuildColumnDefs() {
    let baseColumns = [...this.columnDefs];

    if (this.enableRowExpand) {
      const expandColumn: ColDef = {
        colId: '__expand__',
        headerName: '',
        width: 58,
        minWidth: 58,
        maxWidth: 58,
        sortable: false,
        filter: false,
        suppressMovable: true,
        resizable: false,
        wrapText: true,
        autoHeight: true,
        cellClass: 'ui-ag-grid__expand-col',
        colSpan: (params) => {
          const rowId = this.getRowId(params.data);
          return this.expandedRowIds.has(rowId) ? params.api.getAllDisplayedColumns().length || 1 : 1;
        },
        cellRenderer: (params: ICellRendererParams) => this.buildExpandButtonHtml(params.data),
      };
      baseColumns = [expandColumn, ...baseColumns];
    }

    if (!this.rowActions.length) {
      this.resolvedColumnDefs = baseColumns;
      return;
    }

    const actionColumn: ColDef = {
      colId: '__actions__',
      headerName: this.actionColumnHeader,
      sortable: false,
      filter: false,
      suppressMovable: true,
      resizable: false,
      width: this.actionColumnWidth,
      minWidth: 170,
      maxWidth: 360,
      cellRenderer: (params: ICellRendererParams) => this.buildActionButtonsHtml(params.data),
    };

    this.resolvedColumnDefs = [...baseColumns, actionColumn];
  }

  private buildActionButtonsHtml(row: any): string {
    const visibleActions = this.rowActions.filter((action) => (action.visible ? action.visible(row) : true));
    if (!visibleActions.length) return '';

    return `<div class="ui-ag-grid__actions">${visibleActions
      .map((action) => {
        const enabled = action.enabled ? action.enabled(row) : true;
        const disabledAttr = enabled ? '' : 'disabled';
        const extraClass = action.cssClass ?? '';
        const icon = action.icon ? `<span class="ui-ag-grid__action-icon">${action.icon}</span>` : '';

        const labelHtml = this.showActionLabels ? `<span>${action.label}</span>` : '';
        const iconOnlyClass = this.showActionLabels ? '' : 'ui-ag-grid__action-btn--icon';

        return `<button type="button" class="ui-ag-grid__action-btn ${iconOnlyClass} ${extraClass}" data-action-id="${action.id}" title="${action.label}" aria-label="${action.label}" ${disabledAttr}>${icon}${labelHtml}</button>`;
      })
      .join('')}</div>`;
  }

  private buildExpandButtonHtml(row: any): string {
    if (!row) return '';
    const rowId = this.getRowId(row);
    const expanded = this.expandedRowIds.has(rowId);
    const icon = expanded ? '▾' : '▸';
    const title = expanded ? 'Ocultar detalle' : 'Ver detalle';
    const details = expanded ? this.buildDetailHtml(row) : '';

    return `
      <div class="ui-ag-grid__expand-cell">
        <button
          type="button"
          class="ui-ag-grid__expand-btn"
          data-expand-toggle="1"
          title="${title}"
          aria-label="${title}">
          ${icon}
        </button>
        <div class="ui-ag-grid__expand-content">
          ${details}
        </div>
      </div>
    `;
  }

  private buildDetailHtml(row: any): string {
    const fields = this.detailFields.length ? this.detailFields : Object.keys(row ?? {}).slice(0, 5);
    const items = fields
      .filter((field) => row[field] !== undefined)
      .map((field) => {
        const raw = row[field];
        const value = raw == null ? '-' : this.escapeHtml(String(raw));
        return `
          <div class="ui-ag-grid__detail-row">
            <span class="ui-ag-grid__detail-label">${this.escapeHtml(field)}</span>
            <span class="ui-ag-grid__detail-value">${value}</span>
          </div>
        `;
      })
      .join('');

    return `
      <div class="ui-ag-grid__detail-wrap">
        <div class="ui-ag-grid__detail-title">Detalle del elemento</div>
        <div class="ui-ag-grid__detail-grid">${items}</div>
      </div>
    `;
  }

  private extractActionId(target: HTMLElement | null): string | null {
    if (!target) return null;
    const actionNode = target.closest('[data-action-id]') as HTMLElement | null;
    return actionNode?.dataset['actionId'] ?? null;
  }

  private extractExpandToggle(target: HTMLElement | null): boolean {
    if (!target) return false;
    return !!target.closest('[data-expand-toggle]');
  }

  private toggleRowExpand(row: any) {
    const rowId = this.getRowId(row);
    const isExpanded = this.expandedRowIds.has(rowId);

    if (isExpanded) {
      this.expandedRowIds.delete(rowId);
    } else {
      this.expandedRowIds.add(rowId);
    }

    this.gridApi?.resetRowHeights();
    this.gridApi?.refreshCells({ force: true });

    this.rowExpandToggle.emit({
      expanded: !isExpanded,
      row,
    });
  }

  private syncExpandedRowsWithIncomingData() {
    if (!this.enableRowExpand) {
      this.expandedRowIds.clear();
      return;
    }

    const availableIds = new Set((this.rowData ?? []).map((row) => this.getRowId(row)));
    this.expandedRowIds.forEach((rowId) => {
      if (!availableIds.has(rowId)) this.expandedRowIds.delete(rowId);
    });

    if (this.defaultRowExpanded && this.expandedRowIds.size === 0 && this.rowData?.length) {
      this.expandedRowIds.add(this.getRowId(this.rowData[0]));
    }
  }

  private getRowHeightForNode(params: RowHeightParams): number | undefined {
    if (!this.enableRowExpand || !params.data) return undefined;
    const rowId = this.getRowId(params.data);
    return this.expandedRowIds.has(rowId) ? this.getExpandedHeight(params.data) : undefined;
  }

  private syncSelectionOptions() {
    this.rowSelection = {
      mode: this.selectionMode,
      enableClickSelection: true,
      checkboxes: this.showSelectionCheckbox,
      headerCheckbox: this.showSelectionCheckbox && this.selectionMode === 'multiRow',
    };
  }

  private getRowId(row: any): string {
    const rawId = row?.[this.rowIdField];
    if (rawId == null) {
      return JSON.stringify(row);
    }
    return String(rawId);
  }

  private getExpandedHeight(row: any): number {
    const fieldsCount = (this.detailFields?.length || Object.keys(row ?? {}).length || 1);
    const rows = Math.max(1, Math.ceil(fieldsCount / 2));
    const dynamicHeight = 64 + rows * 42;
    return Math.max(this.expandedRowHeight, dynamicHeight);
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private buildQueryCacheKey(query: UiAgGridQuery): string {
    return JSON.stringify({
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
      search: query.search,
      sorts: query.sorts,
    });
  }
}
