// src/app/features/events/components/event-overview/event-overview.component.ts
import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AppEvent } from '@core/models';

interface EventStatus {
  label: string;
  class: string;
}

interface EventStats {
  users: number;
  groups: number;
  activities: number;
}

@Component({
  selector: 'app-event-overview',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './event-overview.component.html',
  styleUrl: './event-overview.component.scss',
})
export class EventOverviewComponent {
  @Input({ required: true }) event!: AppEvent;
  @Input({ required: true }) eventStatus!: EventStatus;
  @Input({ required: true }) eventStats!: EventStats;

  // Computed para formatear las fechas
  readonly formattedDates = computed((): string => {
    if (!this.event) return '';

    const start = new Date(this.event.startDate);
    const end = new Date(this.event.endDate);

    const startStr = start.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const endStr = end.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    if (startStr === endStr) {
      return startStr;
    } else {
      return `${startStr} - ${endStr}`;
    }
  });

  // Computed para formatear las horas
  readonly formattedTimes = computed((): string => {
    if (!this.event) return '';

    const start = new Date(this.event.startDate);
    const end = new Date(this.event.endDate);

    const startTime = start.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const endTime = end.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${startTime} - ${endTime}`;
  });

  // Computed para la duración del evento
  readonly eventDuration = computed((): string => {
    if (!this.event) return '';

    const start = new Date(this.event.startDate);
    const end = new Date(this.event.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays === 1 ? '1 día' : `${diffDays} días`;
  });

  // Computed para determinar si tiene banner
  readonly hasBanner = computed((): boolean => {
    return !!(this.event?.banner && this.event.banner.trim());
  });

  // Manejo de errores de imagen
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
