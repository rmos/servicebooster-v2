import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

type PackageStatus = 'READY' | 'PENDING' | 'FAILED';

export interface PackageRow {
  name: string;
  version: string;
  country: 'IE' | 'PT' | 'ES';
  status: PackageStatus;
  updatedAt: string;
}

@Component({
  selector: 'lib-ui-sb-packages',
  standalone: true,
  templateUrl: './ui-sb-packages.html',
  styleUrl: './ui-sb-packages.css',
  imports: [CommonModule, FormsModule, TableModule, InputTextModule, ButtonModule, TagModule],
  
})
export class PackagesComponent {
  private readonly _rows = signal<PackageRow[]>([
    { name: 'ambar-core', version: '1.2.3', country: 'ES', status: 'READY', updatedAt: new Date(Date.now() - 3600_000).toISOString() },
    { name: 'ireland-ui', version: '0.9.0', country: 'IE', status: 'PENDING', updatedAt: new Date(Date.now() - 7200_000).toISOString() },
    { name: 'portugal-ui', version: '0.8.4', country: 'PT', status: 'READY', updatedAt: new Date(Date.now() - 24 * 3600_000).toISOString() },
    { name: 'legacy-bundle', version: '5.18.0', country: 'ES', status: 'FAILED', updatedAt: new Date(Date.now() - 2 * 24 * 3600_000).toISOString() },
  ]);

  searchText = '';

  filtered = computed(() => {
    const q = this.searchText.trim().toLowerCase();
    const rows = this._rows();
    if (!q) return rows;
    return rows.filter(r => (`${r.name} ${r.version} ${r.country} ${r.status}`).toLowerCase().includes(q));
  });

  refresh() {
    this._rows.set([...this._rows()]);
  }

  clear() {
    this.searchText = '';
  }

  view(row: PackageRow) {
    console.log('View package:', row);
  }

  tagSeverity(status: PackageStatus): 'success' | 'warn' | 'danger' | 'info' {
    switch (status) {
      case 'READY': return 'success';
      case 'PENDING': return 'warn';
      case 'FAILED': return 'danger';
      default: return 'info';
    }
  }
}
