import { Component } from '@angular/core';
import { NxWelcome } from './nx-welcome';
 
@Component({
  selector: 'app-ireland-entry',
  standalone: true,
  imports: [NxWelcome],
  template: `<app-nx-welcome></app-nx-welcome>`,
})
export class RemoteEntry {}
