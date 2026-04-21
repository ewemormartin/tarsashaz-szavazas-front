import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // Importáld ezeket!

import { routes } from './app.routes';
import { authInterceptor } from './auth.interceptor'; // Importáld az új interceptort!

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    // Itt regisztráljuk a HTTP klienst és az interceptort:
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};