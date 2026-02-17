import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { PortugalEntryComponent } from './app/remote-entry/entry';

bootstrapApplication(PortugalEntryComponent, appConfig).catch((err) => console.error(err));
