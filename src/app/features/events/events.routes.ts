import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/events-list/events-list.component').then(
        (m) => m.EventsListComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/event-details/event-details.component').then(
        (m) => m.EventDetailsComponent,
      ),
  },
  {
    path: ':id/survey/:surveyId/report',
    loadComponent: () =>
      import('./components/survey-report/survey-report.component').then(
        (m) => m.SurveyReportComponent,
      ),
  },
];
