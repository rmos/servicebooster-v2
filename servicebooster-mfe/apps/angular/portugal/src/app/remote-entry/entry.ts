import { Component } from '@angular/core';
import { PackagesComponent } from '@servicebooster-mfe/ui-sb-packages';

@Component({
  selector: 'app-portugal-entry',
  standalone: true,
  imports: [PackagesComponent],
  template: `<lib-ui-sb-packages />`,
})
export class PortugalEntryComponent {}