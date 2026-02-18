import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcome } from './nx-welcome';
import { AuthFacade } from './core/auth/auth.facade';

@Component({
  imports: [NxWelcome, RouterModule],
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'shell';

  constructor(public auth: AuthFacade) {}

}
