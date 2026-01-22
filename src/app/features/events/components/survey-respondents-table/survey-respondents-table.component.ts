import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import {
  ReusableTableComponent,
  TableColumn,
  TableConfig,
} from '../../../../shared/components/reusable-table/reusable-table.component';
import { RespondentInfo } from '../../../../core/models/survey.interface';

@Component({
  selector: 'app-survey-respondents-table',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    ReusableTableComponent,
  ],
  templateUrl: './survey-respondents-table.component.html',
  styleUrl: './survey-respondents-table.component.scss',
})
export class SurveyRespondentsTableComponent {
  respondents = input.required<RespondentInfo[]>();
  loading = input<boolean>(false);
  error = input<string | null>(null);

  readonly tableColumns: TableColumn<RespondentInfo>[] = [
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
      type: 'text',
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      type: 'text',
    },
    {
      key: 'groups',
      label: 'Grupos',
      sortable: false,
      type: 'custom',
    },
    {
      key: 'submittedAt',
      label: 'Fecha de Respuesta',
      sortable: true,
      type: 'date',
    },
  ];

  readonly tableConfig: TableConfig = {
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    showFirstLastButtons: true,
    sortable: true,
    stickyHeader: true,
    showFilter: true,
    filterPlaceholder: 'Buscar por nombre o email...',
  };

  readonly processedRespondents = computed(() => {
    return this.respondents().map((r) => ({
      ...r,
      submittedAt: new Date(r.submittedAt).toLocaleString('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    }));
  });

  trackByRespondentId(index: number, respondent: RespondentInfo): string {
    return respondent.id;
  }

  onSortChange(event: any): void {
    // Handle sort if needed
  }

  onPageChange(event: any): void {
    // Handle page change if needed
  }

  /**
   * Calcula el color de contraste (blanco o negro) basado en el color de fondo
   */
  getContrastColor(hexColor: string): string {
    // Remove # if present
    const hex = hexColor.replace('#', '');

    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black for light backgrounds, white for dark
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }
}
