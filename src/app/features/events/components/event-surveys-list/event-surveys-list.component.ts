import {
  Component,
  Input,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

// Reusable Table
import {
  ReusableTableComponent,
  TableColumn,
  TableConfig,
  TableAction,
} from '../../../../shared/components/reusable-table/reusable-table.component';

// Models & Services
import { Survey, SurveyType } from '@core/models/survey.interface';
import { SurveyService } from '@core/services/survey.service';
import { CreateSurveyModalComponent } from '@shared/components/modals/create-survey-modal/create-survey-modal.component';

@Component({
  selector: 'app-event-surveys-list',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    ReusableTableComponent,
  ],
  templateUrl: './event-surveys-list.component.html',
  styleUrls: ['./event-surveys-list.component.scss'],
})
export class EventSurveysListComponent implements OnInit {
  @Input({ required: true }) eventId!: string;

  private surveyService = inject(SurveyService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  // Signals
  readonly surveys = signal<Survey[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Computed
  readonly entrySurveys = computed(() =>
    this.surveys().filter((survey) => survey.type === 'entry'),
  );
  readonly exitSurveys = computed(() =>
    this.surveys().filter((survey) => survey.type === 'exit'),
  );

  // Use surveys directly since we handle formatting in the template
  readonly processedSurveys = computed(() => {
    return this.surveys();
  });

  // Table Configuration
  readonly tableColumns: TableColumn<Survey>[] = [
    {
      key: 'title',
      label: 'Título de la Encuesta',
      sortable: true,
      type: 'text',
    },
    {
      key: 'description',
      label: 'Descripción',
      sortable: false,
      type: 'text',
      width: '300px',
    },
    {
      key: 'type',
      label: 'Tipo',
      sortable: true,
      type: 'text',
      width: '120px',
      align: 'center',
    },
    {
      key: 'isActive',
      label: 'Estado',
      sortable: true,
      type: 'text',
      width: '100px',
      align: 'center',
    },
    {
      key: 'questions',
      label: 'Preguntas',
      sortable: false,
      type: 'custom',
      width: '100px',
      align: 'center',
    },
  ];

  readonly tableConfig: TableConfig = {
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25],
    showFirstLastButtons: true,
    sortable: true,
    stickyHeader: false,
  };

  readonly tableActions: TableAction<any>[] = [
    {
      icon: 'visibility',
      label: 'Ver encuesta',
      color: 'primary',
      handler: (processedSurvey) => {
        const survey = this.getOriginalSurvey(processedSurvey.id);
        if (survey) this.onViewSurvey(survey);
      },
    },
    {
      icon: 'bar_chart',
      label: 'Ver reporte',
      color: 'accent',
      handler: (processedSurvey) => {
        const survey = this.getOriginalSurvey(processedSurvey.id);
        if (survey) this.onViewReport(survey);
      },
    },
    {
      icon: 'edit',
      label: 'Editar encuesta',
      color: 'primary',
      handler: (processedSurvey) => {
        const survey = this.getOriginalSurvey(processedSurvey.id);
        if (survey) this.onEditSurvey(survey);
      },
    },
    {
      icon: 'delete',
      label: 'Eliminar encuesta',
      color: 'warn',
      handler: (processedSurvey) => {
        const survey = this.getOriginalSurvey(processedSurvey.id);
        if (survey) this.onDeleteSurvey(survey);
      },
    },
  ];

  ngOnInit(): void {
    this.loadSurveys();
  }

  loadSurveys(): void {
    this.loading.set(true);
    this.error.set(null);

    this.surveyService.getSurveysByEvent(this.eventId).subscribe({
      next: (surveys) => {
        this.surveys.set(surveys);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading surveys:', error);
        this.error.set('Error al cargar las encuestas');
        this.loading.set(false);
      },
    });
  }

  openCreateSurveyModal(): void {
    const dialogRef = this.dialog.open(CreateSurveyModalComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { eventId: this.eventId, mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'create') {
        this.createSurvey(result.data);
      }
    });
  }

  private createSurvey(surveyData: any): void {
    this.surveyService.createSurveyWithQuestions(surveyData).subscribe({
      next: (survey) => {
        if (survey) {
          this.showMessage('Encuesta creada exitosamente');
          this.loadSurveys();
        }
      },
      error: (error) => {
        console.error('Error creating survey:', error);
        this.showMessage('Error al crear la encuesta', 'error');
      },
    });
  }

  onViewSurvey(survey: Survey): void {
    // TODO: Implement survey view modal or navigation
    this.showMessage('Funcionalidad de vista detallada próximamente');
  }

  onViewReport(survey: Survey): void {
    // Navigate to the survey report page
    this.router.navigate([
      'dashboard',
      this.eventId,
      'survey',
      survey.id,
      'report',
    ]);
  }

  onViewMetrics(survey: Survey): void {
    // Quick metrics preview in snackbar (kept for backward compatibility)
    this.surveyService.getSurveyMetrics(survey.id).subscribe({
      next: (metrics) => {
        if (metrics) {
          console.log('Survey metrics:', metrics);
          this.showMessage(
            `Métricas de "${survey.title}": ${metrics.totalResponses} respuestas de ${metrics.totalQuestions} preguntas`,
          );
        }
      },
      error: (error) => {
        console.error('Error loading metrics:', error);
        this.showMessage('Error al cargar las métricas', 'error');
      },
    });
  }

  onEditSurvey(survey: Survey): void {
    // First get the full survey with questions
    this.surveyService.getSurveyWithQuestions(survey.id).subscribe({
      next: (fullSurvey) => {
        if (fullSurvey) {
          const dialogRef = this.dialog.open(CreateSurveyModalComponent, {
            width: '800px',
            maxHeight: '90vh',
            data: {
              eventId: this.eventId,
              mode: 'edit',
              survey: fullSurvey,
            },
          });

          dialogRef.afterClosed().subscribe((result) => {
            if (result && result.action === 'edit') {
              this.updateSurvey(survey.id, result.data);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error loading survey for edit:', error);
        this.showMessage('Error al cargar la encuesta para editar', 'error');
      },
    });
  }

  private updateSurvey(surveyId: string, surveyData: any): void {
    this.surveyService
      .updateSurveyWithQuestions(surveyId, surveyData)
      .subscribe({
        next: (updatedSurvey) => {
          if (updatedSurvey) {
            this.showMessage('Encuesta actualizada exitosamente');
            this.loadSurveys();
          }
        },
        error: (error) => {
          console.error('Error updating survey:', error);
          this.showMessage('Error al actualizar la encuesta', 'error');
        },
      });
  }

  onDeleteSurvey(survey: Survey): void {
    if (
      confirm(
        `¿Estás seguro de que deseas eliminar la encuesta "${survey.title}"? Esta acción eliminará también todas las respuestas asociadas.`,
      )
    ) {
      this.deleteSurvey(survey.id);
    }
  }

  private deleteSurvey(surveyId: string): void {
    this.surveyService.deleteSurvey(surveyId).subscribe({
      next: (success) => {
        if (success) {
          this.showMessage('Encuesta eliminada correctamente');
          this.loadSurveys();
        }
      },
      error: (error) => {
        console.error('Error deleting survey:', error);
        this.showMessage('Error al eliminar la encuesta', 'error');
      },
    });
  }

  // Table event handlers
  onSortChange(sort: Sort): void {}

  onPageChange(event: PageEvent): void {}

  onRowClick(item: any): void {
    const originalSurvey = this.getOriginalSurvey(item.id);
    if (originalSurvey) {
      this.onViewSurvey(originalSurvey);
    }
  }

  // Helper method to get original survey from processed data
  private getOriginalSurvey(surveyId: string): Survey | null {
    return this.surveys().find((survey) => survey.id === surveyId) || null;
  }

  // Helper methods for template
  getSurveyTypeLabel(type: SurveyType): string {
    return type === 'entry' ? 'Entrada' : 'Salida';
  }

  getSurveyTypeClass(type: SurveyType): string {
    return type === 'entry' ? 'type-entry' : 'type-exit';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Activa' : 'Inactiva';
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  getQuestionsCount(survey: Survey): number {
    return survey.questions?.length || 0;
  }

  // Track by function para mejor performance
  trackBySurveyId(index: number, survey: Survey): string {
    return survey.id;
  }

  private showMessage(
    message: string,
    type: 'success' | 'error' = 'success',
  ): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      panelClass: type === 'error' ? 'error-snackbar' : 'success-snackbar',
    });
  }
}

