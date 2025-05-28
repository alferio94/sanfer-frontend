// src/app/features/events/pages/events-list/events-list.component.ts
import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Material importsimport { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { AppEvent } from '@core/models';
import { EventsService } from '@core/services/events.service';
import { ModalService } from '@core/services/modal.service';
@Component({
  selector: 'app-events-list',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    EventCardComponent,
  ],
  templateUrl: './events-list.component.html',
  styleUrl: './events-list.component.scss',
})
export class EventsListComponent {
  private router = inject(Router);
  private eventsService = inject(EventsService);
  private modalService = inject(ModalService);
  private snackBar = inject(MatSnackBar);

  // Reactive properties
  readonly loading = this.eventsService.loading;
  readonly error = this.eventsService.error;
  readonly allEvents = this.eventsService.events;

  // Computed para filtrar solo eventos activos y próximos
  readonly activeAndUpcomingEvents = computed(() => {
    const events = this.allEvents();
    const now = new Date();
    const filteredEvents = events
      .filter((event) => {
        return new Date(event.endDate) >= now;
      })
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );
    return filteredEvents;
  });

  // Computed para estadísticas
  readonly stats = computed(() => {
    const events = this.activeAndUpcomingEvents();
    const now = new Date();

    const upcoming = events.filter(
      (event) => new Date(event.startDate) > now,
    ).length;

    const active = events.filter(
      (event) =>
        new Date(event.startDate) <= now && new Date(event.endDate) >= now,
    ).length;

    return {
      total: events.length,
      active,
      upcoming,
    };
  });

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventsService.getAllEvents().subscribe({
      next: (events) => {
        if (events.length === 0) {
          this.showMessage('No hay eventos registrados aún');
        }
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.showMessage('Error al cargar los eventos', 'error');
      },
    });
  }

  openCreateEventModal(): void {
    this.modalService.openCreateEventModal().subscribe({
      next: (result) => {
        if (result && result.action === 'create' && result.data) {
          this.createEvent(result.data);
        }
      },
      error: (error) => {
        console.error('Error opening create event modal:', error);
        this.showMessage('Error al abrir el formulario', 'error');
      },
    });
  }

  private createEvent(eventData: any): void {
    this.eventsService.createEvent(eventData).subscribe({
      next: (event) => {
        if (event) {
          this.showMessage('Evento creado exitosamente');
          // Opcional: navegar al detalle del evento
          // this.router.navigate(['/events', event.id]);
        } else {
          this.showMessage('Error al crear el evento', 'error');
        }
      },
      error: (error) => {
        console.error('Error creating event:', error);
        this.showMessage(error.error.message);
      },
    });
  }

  onEventClick(event: AppEvent): void {
    this.router.navigate(['/events', event.id]);
  }

  onEventEdit(event: AppEvent): void {
    this.modalService.openEditEventModal(event).subscribe({
      next: (result) => {
        if (result && result.action === 'edit' && result.data) {
          this.updateEvent(event.id, result.data);
        }
      },
      error: (error) => {
        console.error('Error opening edit event modal:', error);
        this.showMessage('Error al abrir el formulario', 'error');
      },
    });
  }

  onEventDelete(event: AppEvent): void {
    this.modalService.openDeleteConfirmModal(event.name).subscribe({
      next: (confirmed) => {
        if (confirmed) {
          this.deleteEvent(event);
        }
      },
    });
  }

  private updateEvent(eventId: string, eventData: any): void {
    this.eventsService.updateEvent(eventId, eventData).subscribe({
      next: (event) => {
        if (event) {
          this.showMessage('Evento actualizado exitosamente');
        } else {
          this.showMessage('Error al actualizar el evento', 'error');
        }
      },
      error: (error) => {
        console.error('Error updating event:', error);
        this.showMessage('Error al actualizar el evento', 'error');
      },
    });
  }

  private deleteEvent(event: AppEvent): void {
    this.eventsService.deleteEvent(event.id).subscribe({
      next: (success) => {
        if (success) {
          this.showMessage('Evento eliminado correctamente');
        } else {
          this.showMessage('Error al eliminar el evento', 'error');
        }
      },
      error: (error) => {
        console.error('Error deleting event:', error);
        this.showMessage('Error al eliminar el evento', 'error');
      },
    });
  }

  private showMessage(
    message: string,
    type: 'success' | 'error' = 'success',
  ): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      panelClass: type === 'error' ? 'error-snackbar' : 'success-snackbar',
    });
  }

  // Track by function para mejor performance en ngFor
  trackByEventId(index: number, event: AppEvent): string {
    return event.id;
  }

  // Debug info
  get debugInfo() {
    return {
      totalEvents: this.allEvents().length,
      filteredEvents: this.activeAndUpcomingEvents().length,
      loading: this.loading(),
      error: this.error(),
      stats: this.stats(),
    };
  }
}
