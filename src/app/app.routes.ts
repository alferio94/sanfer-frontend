import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Ruta de login (pública)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  // Dashboard principal (protegido)
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/events/events.routes').then((m) => m.routes),
      },
    ],
  },
  // Ruta de eventos (redirige a dashboard para compatibilidad)
  {
    path: 'events',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  // Ruta por defecto
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  // Ruta wildcard para 404
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
