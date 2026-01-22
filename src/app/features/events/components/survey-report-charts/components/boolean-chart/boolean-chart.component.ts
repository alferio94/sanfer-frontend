import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { BooleanStats } from '../../../../../../core/models/survey.interface';

@Component({
  selector: 'app-boolean-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, NgxChartsModule],
  templateUrl: './boolean-chart.component.html',
  styleUrl: './boolean-chart.component.scss',
})
export class BooleanChartComponent {
  questionText = input.required<string>();
  stats = input.required<BooleanStats>();
  totalAnswers = input.required<number>();

  readonly colorScheme: Color = {
    name: 'boolean',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#4caf50', '#ef3b42'],
  };

  readonly chartData = computed(() => {
    const { yes, no } = this.stats();
    return [
      { name: 'Sí', value: yes.count },
      { name: 'No', value: no.count },
    ];
  });

  readonly isPositive = computed(() => {
    return this.stats().yes.percentage >= 50;
  });
}
