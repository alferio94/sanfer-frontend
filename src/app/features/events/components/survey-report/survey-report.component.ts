import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';
import * as XLSX from 'xlsx';

import { SurveyService } from '../../../../core/services/survey.service';
import { GroupsService } from '../../../../core/services/groups.service';
import {
  SurveyReportResponse,
  SurveyRespondentsResponse,
  CompletionRateResponse,
  SurveyExportResponse,
  GroupInfo,
} from '../../../../core/models/survey.interface';

import { SurveyReportKpisComponent } from '../survey-report-kpis/survey-report-kpis.component';
import { SurveyReportChartsComponent } from '../survey-report-charts/survey-report-charts.component';
import { SurveyRespondentsTableComponent } from '../survey-respondents-table/survey-respondents-table.component';

@Component({
  selector: 'app-survey-report',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    SurveyReportKpisComponent,
    SurveyReportChartsComponent,
    SurveyRespondentsTableComponent,
  ],
  templateUrl: './survey-report.component.html',
  styleUrl: './survey-report.component.scss',
})
export class SurveyReportComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private surveyService = inject(SurveyService);
  private groupsService = inject(GroupsService);
  private snackBar = inject(MatSnackBar);

  // Route params
  surveyId: string | null = null;
  eventId: string | null = null;

  // State
  readonly loading = signal<boolean>(true);
  readonly exporting = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Data
  readonly report = signal<SurveyReportResponse | null>(null);
  readonly respondents = signal<SurveyRespondentsResponse | null>(null);
  readonly completionRate = signal<CompletionRateResponse | null>(null);
  readonly availableGroups = signal<GroupInfo[]>([]);
  readonly selectedGroupId = signal<string | null>(null);

  // Computed
  readonly surveyTitle = computed(() => this.report()?.survey.title ?? 'Cargando...');
  readonly surveyType = computed(() => this.report()?.survey.type ?? 'exit');
  readonly eventName = computed(() => this.report()?.survey.eventName ?? '');

  readonly surveyTypeLabel = computed(() => {
    return this.surveyType() === 'entry' ? 'Entrada' : 'Salida';
  });

  readonly surveyTypeClass = computed(() => {
    return this.surveyType() === 'entry' ? 'type-entry' : 'type-exit';
  });

  readonly totalAssigned = computed(() => {
    return this.completionRate()?.totalAssigned ?? 0;
  });

  readonly filterLabel = computed(() => {
    const groupName = this.report()?.filters.groupName;
    return groupName ? `Filtrado por: ${groupName}` : 'Todos los grupos';
  });

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.surveyId = params['surveyId'];
      this.eventId = params['id'];

      if (this.surveyId && this.eventId) {
        this.loadData();
        this.loadAvailableGroups();
      }
    });
  }

  loadData(): void {
    if (!this.surveyId) return;

    this.loading.set(true);
    this.error.set(null);

    const groupId = this.selectedGroupId() ?? undefined;

    forkJoin({
      report: this.surveyService.getSurveyReport(this.surveyId, groupId),
      respondents: this.surveyService.getSurveyRespondents(this.surveyId, groupId),
      completionRate: this.surveyService.getCompletionRate(this.surveyId, groupId),
    }).subscribe({
      next: ({ report, respondents, completionRate }) => {
        this.report.set(report);
        this.respondents.set(respondents);
        this.completionRate.set(completionRate);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading survey report:', error);
        this.error.set('Error al cargar el reporte de la encuesta');
        this.loading.set(false);
      },
    });
  }

  loadAvailableGroups(): void {
    if (!this.eventId) return;

    this.groupsService.getGroupsByEvent(this.eventId).subscribe({
      next: (groups) => {
        this.availableGroups.set(
          groups.map((g) => ({
            id: g.id,
            name: g.name,
            color: g.color,
          }))
        );
      },
      error: (error) => {
        console.error('Error loading groups:', error);
      },
    });
  }

  onGroupFilterChange(groupId: string | null): void {
    this.selectedGroupId.set(groupId);
    this.loadData();
  }

  async exportToExcel(): Promise<void> {
    if (!this.surveyId) return;

    this.exporting.set(true);

    const groupId = this.selectedGroupId() ?? undefined;

    this.surveyService.getSurveyExportData(this.surveyId, groupId).subscribe({
      next: (exportData) => {
        if (exportData) {
          this.generateExcel(exportData);
          this.showMessage('Archivo Excel generado exitosamente');
        } else {
          this.showMessage('Error al obtener datos para exportar', 'error');
        }
        this.exporting.set(false);
      },
      error: (error) => {
        console.error('Error exporting:', error);
        this.showMessage('Error al exportar los datos', 'error');
        this.exporting.set(false);
      },
    });
  }

  private generateExcel(data: SurveyExportResponse): void {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Survey Info
    const infoData = [
      ['Campo', 'Valor'],
      ['Título de la Encuesta', data.survey.title],
      ['Descripción', data.survey.description ?? 'Sin descripción'],
      ['Evento', data.survey.eventName],
      ['Tipo', data.survey.type === 'entry' ? 'Entrada' : 'Salida'],
      ['Fecha de Exportación', new Date(data.survey.exportedAt).toLocaleString('es-MX')],
      ['Total de Respuestas', data.data.length],
      ['Filtro de Grupo', data.filters.groupName ?? 'Todos los grupos'],
    ];
    const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Información');

    // Sheet 2: Responses
    const headers = [
      'Nombre',
      'Email',
      'Grupos',
      'Fecha de Respuesta',
      ...data.questions.map((q) => q.text),
    ];

    const rows = data.data.map((respondent) => {
      const answers = data.questions.map((question) => {
        const answer = respondent.answers.find((a) => a.questionId === question.id);
        if (!answer) return '';

        const value = answer.answer;
        if (value === null || value === undefined) return '';
        if (typeof value === 'boolean') return value ? 'Sí' : 'No';
        return String(value);
      });

      return [
        respondent.respondentName,
        respondent.respondentEmail,
        respondent.groups.join(', '),
        new Date(respondent.submittedAt).toLocaleString('es-MX'),
        ...answers,
      ];
    });

    const responsesData = [headers, ...rows];
    const responsesSheet = XLSX.utils.aoa_to_sheet(responsesData);

    // Auto-width columns
    const maxWidths = headers.map((_, colIndex) => {
      const maxLength = Math.max(
        headers[colIndex].length,
        ...rows.map((row) => String(row[colIndex] ?? '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    responsesSheet['!cols'] = maxWidths;

    XLSX.utils.book_append_sheet(workbook, responsesSheet, 'Respuestas');

    // Generate filename
    const sanitizedTitle = data.survey.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${sanitizedTitle}_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);
  }

  goBack(): void {
    this.router.navigate(['dashboard', this.eventId]);
  }

  private showMessage(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'error' ? 'snackbar-error' : 'snackbar-success',
    });
  }
}
