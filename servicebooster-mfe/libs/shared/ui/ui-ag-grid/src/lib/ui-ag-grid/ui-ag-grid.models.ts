export type UiAgGridMode = 'client' | 'server' | 'hybrid';

export interface UiAgGridSort {
  colId: string;
  sort: 'asc' | 'desc';
  sortIndex?: number | null;
}

export interface UiAgGridQuery {
  pageIndex: number;
  pageSize: number;
  search: string;
  sorts: UiAgGridSort[];
}

export interface UiAgGridRowAction<RowType = any> {
  id: string;
  label: string;
  cssClass?: string;
  icon?: string;
  visible?: (row: RowType) => boolean;
  enabled?: (row: RowType) => boolean;
}

export interface UiAgGridActionClick<RowType = any> {
  actionId: string;
  row: RowType;
}

export interface UiAgGridExpandToggle<RowType = any> {
  expanded: boolean;
  row: RowType;
}
