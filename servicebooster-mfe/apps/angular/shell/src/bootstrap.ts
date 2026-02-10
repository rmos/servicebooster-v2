import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
//import { AppComponent } from './app/app.component';
//import { installSessionBridge } from './app/core/auth/session-bridge';
import { AuthFacade } from './app/core/auth/auth.facade';
import { installSessionBridge } from '@shared/shared-auth';

bootstrapApplication(App, appConfig).then((appRef) => {
  const auth = appRef.injector.get(AuthFacade);
  installSessionBridge(auth);
});
