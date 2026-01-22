import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { MultipleChoiceStats } from '../../../../../../core/models/survey.interface';

@Component({
  selector: 'app-multiple-choice-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, NgxChartsModule],
  templateUrl: './multiple-choice-chart.component.html',
  styleUrl: './multiple-choice-chart.component.scss',
})
export class MultipleChoiceChartComponent {
  questionText = input.required<string>();
  stats = input.required<MultipleChoiceStats>();
  totalAnswers = input.required<number>();

  readonly colorScheme: Color = {
    name: 'multipleChoice',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#ef3b42', '#3fa4c5', '#81c181', '#ff9800', '#9c27b0', '#607d8b'],
  };

  readonly chartData = computed(() => {
    const distribution = this.stats().distribution;
    return Object.entries(distribution).map(([option, data]) => ({
      name: option,
      value: data.count,
      extra: { percentage: data.percentage },
    }));
  });

  readonly sortedOptions = computed(() => {
    const distribution = this.stats().distribution;
    return Object.entries(distribution)
      .map(([option, data]) => ({
        option,
        count: data.count,
        percentage: data.percentage,
      }))
      .sort((a, b) => b.count - a.count);
  });

  labelFormatting = (name: string): string => {
    const data = this.stats().distribution[name];
    if (data) {
      return `${name}: ${data.percentage.toFixed(1)}%`;
    }
    return name;
  };
}
