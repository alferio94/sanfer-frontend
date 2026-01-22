import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { RatingStats } from '../../../../../../core/models/survey.interface';

@Component({
  selector: 'app-rating-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, NgxChartsModule],
  templateUrl: './rating-chart.component.html',
  styleUrl: './rating-chart.component.scss',
})
export class RatingChartComponent {
  questionText = input.required<string>();
  stats = input.required<RatingStats>();
  totalAnswers = input.required<number>();

  readonly colorScheme: Color = {
    name: 'rating',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#ef3b42', '#ff6b6b', '#ffa726', '#81c181', '#4caf50'],
  };

  readonly chartData = computed(() => {
    const distribution = this.stats().distribution;
    return Object.entries(distribution)
      .map(([rating, count]) => ({
        name: `${rating} estrella${Number(rating) > 1 ? 's' : ''}`,
        value: count,
        extra: { rating: Number(rating) },
      }))
      .sort((a, b) => a.extra.rating - b.extra.rating);
  });

  readonly averagePosition = computed(() => {
    const avg = this.stats().average;
    return ((avg - 1) / 4) * 100; // Assuming 1-5 scale
  });
}
