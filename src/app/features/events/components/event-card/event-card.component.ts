// src/app/features/events/components/event-card/event-card.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

// Models
import { AppEvent } from '@core/models';

interface EventStatus {
  label: string;
  class: string;
  color: string;
}

@Component({
  selector: 'app-event-card',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.scss',
})
export class EventCardComponent {
  @Input({ required: true }) event!: AppEvent;

  @Output() eventClick = new EventEmitter<AppEvent>();
  @Output() eventEdit = new EventEmitter<AppEvent>();
  @Output() eventDelete = new EventEmitter<AppEvent>();

  // Computed para el estado del evento
  readonly eventStatus = computed((): EventStatus => {
    if (!this.event)
      return { label: 'Desconocido', class: 'unknown', color: 'gray' };

    const now = new Date();
    const startDate = new Date(this.event.startDate);
    const endDate = new Date(this.event.endDate);

    if (now >= startDate && now <= endDate) {
      return { label: 'En Curso', class: 'active', color: 'success' };
    } else if (now < startDate) {
      return { label: 'Próximo', class: 'upcoming', color: 'accent' };
    } else {
      return { label: 'Finalizado', class: 'completed', color: 'warn' };
    }
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

  // Computed para formatear las fechas
  readonly formattedDates = computed((): string => {
    if (!this.event) return '';

    const start = new Date(this.event.startDate);
    const end = new Date(this.event.endDate);
    const startStr = start.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const endStr = end.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
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

  // Computed para estadísticas del evento
  readonly eventStats = computed(() => {
    if (!this.event) return { users: 0, groups: 0, activities: 0 };

    return {
      users: this.event.users?.length || 0,
      groups: this.event.groups?.length || 0,
      activities: this.event.agendas?.length || 0,
    };
  });

  onCardClick(event: Event): void {
    // Evitar que se active cuando se hace clic en botones o menús
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('mat-menu')) {
      return;
    }

    this.eventClick.emit(this.event);
  }

  onEditClick(): void {
    this.eventEdit.emit(this.event);
  }

  onDeleteClick(): void {
    this.eventDelete.emit(this.event);
  }

  onViewDetailsClick(): void {
    this.eventClick.emit(this.event);
  }

  // Manejo de errores de imagen
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  // Computed para determinar si tiene banner
  readonly hasBanner = computed((): boolean => {
    return !!(this.event?.banner && this.event.banner.trim());
  });

  // Debug info
  get debugInfo() {
    return {
      eventId: this.event?.id,
      status: this.eventStatus(),
      duration: this.eventDuration(),
      stats: this.eventStats(),
      hasBanner: this.hasBanner(),
    };
  }
}
