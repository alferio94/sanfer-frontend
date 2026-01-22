import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  QuestionStatistics,
  RatingStats,
  MultipleChoiceStats,
  BooleanStats,
  TextStats,
} from '../../../../core/models/survey.interface';
import { RatingChartComponent } from './components/rating-chart/rating-chart.component';
import { MultipleChoiceChartComponent } from './components/multiple-choice-chart/multiple-choice-chart.component';
import { BooleanChartComponent } from './components/boolean-chart/boolean-chart.component';
import { TextResponsesComponent } from './components/text-responses/text-responses.component';

@Component({
  selector: 'app-survey-report-charts',
  standalone: true,
  imports: [
    CommonModule,
    RatingChartComponent,
    MultipleChoiceChartComponent,
    BooleanChartComponent,
    TextResponsesComponent,
  ],
  templateUrl: './survey-report-charts.component.html',
  styleUrl: './survey-report-charts.component.scss',
})
export class SurveyReportChartsComponent {
  questionStats = input.required<QuestionStatistics[]>();

  isRatingQuestion(question: QuestionStatistics): boolean {
    return question.questionType === 'rating';
  }

  isMultipleChoiceQuestion(question: QuestionStatistics): boolean {
    return question.questionType === 'multiple_choice';
  }

  isBooleanQuestion(question: QuestionStatistics): boolean {
    return question.questionType === 'boolean';
  }

  isTextQuestion(question: QuestionStatistics): boolean {
    return question.questionType === 'text';
  }

  asRatingStats(stats: QuestionStatistics['stats']): RatingStats {
    return stats as RatingStats;
  }

  asMultipleChoiceStats(stats: QuestionStatistics['stats']): MultipleChoiceStats {
    return stats as MultipleChoiceStats;
  }

  asBooleanStats(stats: QuestionStatistics['stats']): BooleanStats {
    return stats as BooleanStats;
  }

  asTextStats(stats: QuestionStatistics['stats']): TextStats {
    return stats as TextStats;
  }
}
