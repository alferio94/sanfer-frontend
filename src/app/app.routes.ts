import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/events/events.routes').then((m) => m.routes),
      },
    ],
  },
];
