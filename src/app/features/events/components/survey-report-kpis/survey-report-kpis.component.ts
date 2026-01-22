import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SurveyReportSummary } from '../../../../core/models/survey.interface';

@Component({
  selector: 'app-survey-report-kpis',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './survey-report-kpis.component.html',
  styleUrl: './survey-report-kpis.component.scss',
})
export class SurveyReportKpisComponent {
  summary = input.required<SurveyReportSummary>();
  totalAssigned = input<number>(0);

  readonly completionColor = computed(() => {
    const rate = this.summary().completionRate;
    if (rate >= 80) return 'success';
    if (rate >= 50) return 'warning';
    return 'danger';
  });

  readonly ratingColor = computed(() => {
    const rating = this.summary().averageRating;
    if (!rating) return 'neutral';
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
    return 'danger';
  });

  readonly pendingResponses = computed(() => {
    return this.totalAssigned() - this.summary().totalResponses;
  });
}
