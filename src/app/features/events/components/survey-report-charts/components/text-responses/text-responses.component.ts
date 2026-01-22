import { Component, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { TextStats } from '../../../../../../core/models/survey.interface';

@Component({
  selector: 'app-text-responses',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
  ],
  templateUrl: './text-responses.component.html',
  styleUrl: './text-responses.component.scss',
})
export class TextResponsesComponent {
  questionText = input.required<string>();
  stats = input.required<TextStats>();
  totalAnswers = input.required<number>();

  readonly showAll = signal(false);
  readonly itemsToShow = 5;

  readonly visibleResponses = computed(() => {
    const responses = this.stats().responses;
    if (this.showAll()) {
      return responses;
    }
    return responses.slice(0, this.itemsToShow);
  });

  readonly hasMore = computed(() => {
    return this.stats().responses.length > this.itemsToShow;
  });

  readonly remainingCount = computed(() => {
    return this.stats().responses.length - this.itemsToShow;
  });

  toggleShowAll(): void {
    this.showAll.update((value) => !value);
  }
}
