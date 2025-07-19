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
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { QuillModule } from 'ngx-quill';

// Auth interceptor
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getStorage, provideStorage } from '@angular/fire/storage';

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

    // Material Date components
    importProvidersFrom(MatNativeDateModule, MatDatepickerModule),

    // Quill editor
    importProvidersFrom(QuillModule.forRoot()),

    // Common providers
    DatePipe,
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'sanfer-f31e7',
        appId: '1:446383178170:web:c2f4e0fce2889d1c261d83',
        storageBucket: 'sanfer-f31e7.firebasestorage.app',
        apiKey: 'AIzaSyC36eEOOh0BgWzPAnaBhHDbPTO1QODngGQ',
        authDomain: 'sanfer-f31e7.firebaseapp.com',
        messagingSenderId: '446383178170',
      }),
    ),
    provideStorage(() => getStorage()),
  ],
};
