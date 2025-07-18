import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withHashLocation,
  withInMemoryScrolling,
} from '@angular/router';

import { routes } from './app.routes';
import { DatePipe } from '@angular/common';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { QuillModule } from 'ngx-quill';

// Auth interceptor
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withHashLocation(), // Usar hash routing para evitar problemas en producción
      withComponentInputBinding(),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'top',
      }),
    ),

    // HTTP Client with interceptors
    provideHttpClient(
      withFetch(), // Usar fetch API en lugar de XMLHttpRequest
      withInterceptors([authInterceptor]),
    ),

    // Animations
    provideAnimationsAsync(),

    // Client Hydration (para SSR si lo usas después)
    provideClientHydration(),

    // Material Date components
    importProvidersFrom(MatNativeDateModule, MatDatepickerModule),

    // Quill editor
    importProvidersFrom(QuillModule.forRoot()),

    // Common providers
    DatePipe,
  ],
};
