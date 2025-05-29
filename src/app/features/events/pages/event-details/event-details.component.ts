// src/app/features/events/pages/event-detail/event-detail.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

// Models & Services
import { AppEvent } from '@core/models';
import { EventsService } from '@core/services/events.service';
import { GroupsService } from '@core/services/groups.service';
import { AgendaService } from '@core/services/agenda.service';
import { UsersService } from '@core/services/users.service';
import { ModalService } from '@core/services/modal.service';

// Components (we'll create these)
import { EventOverviewComponent } from '../../components/event-overview/event-overview.component';
import { EventGroupListComponent } from '../../components/event-group-list/event-group-list.component';
import { EventAgendaListComponent } from '../../components/event-agenda-list/event-agenda-list.component';
import { EventUsersListComponent } from '../../components/event-users-list/event-users-list.component';
@Component({
  selector: 'app-event-details',
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    EventOverviewComponent,
    EventGroupListComponent,
    EventAgendaListComponent,
    EventUsersListComponent,
  ],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss',
})
export class EventDetailsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventsService = inject(EventsService);
  private groupsService = inject(GroupsService);
  private agendaService = inject(AgendaService);
  private usersService = inject(UsersService);
  private modalService = inject(ModalService);
  private snackBar = inject(MatSnackBar);

  // Signals
  readonly event = signal<AppEvent | null>(null);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly selectedTab = signal<number>(0);

  // Computed
  readonly eventStatus = computed(() => {
    const currentEvent = this.event();
    if (!currentEvent) return { label: 'Desconocido', class: 'unknown' };

    const now = new Date();
    const startDate = new Date(currentEvent.startDate);
    const endDate = new Date(currentEvent.endDate);

    if (now >= startDate && now <= endDate) {
      return { label: 'En Curso', class: 'active' };
    } else if (now < startDate) {
      return { label: 'Próximo', class: 'upcoming' };
    } else {
      return { label: 'Finalizado', class: 'completed' };
    }
  });

  readonly eventStats = computed(() => {
    const currentEvent = this.event();
    if (!currentEvent) return { users: 0, groups: 0, activities: 0 };

    return {
      users: currentEvent.users?.length || 0,
      groups: currentEvent.groups?.length || 0,
      activities: currentEvent.agendas?.length || 0,
    };
  });

  readonly eventGroups = () => {
    const currentEvent = this.event();
    if (!currentEvent || !currentEvent.groups) return [];
    return currentEvent.groups;
  };

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const eventId = params['id'];
      if (eventId) {
        this.loadEventDetails(eventId);
      }
    });
  }

  private loadEventDetails(eventId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.eventsService.getEventById(eventId).subscribe({
      next: (event) => {
        if (event) {
          this.event.set(event);
          this.loading.set(false);
        } else {
          this.error.set('Evento no encontrado');
          this.loading.set(false);
        }
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.error.set('Error al cargar el evento');
        this.loading.set(false);
      },
    });
  }

  onTabChange(index: number): void {
    this.selectedTab.set(index);
  }

  onEditEvent(): void {
    const currentEvent = this.event();
    if (currentEvent) {
      this.modalService.openEditEventModal(currentEvent).subscribe({
        next: (result) => {
          if (result && result.action === 'edit' && result.data) {
            this.updateEvent(currentEvent.id, result.data);
          }
        },
      });
    }
  }

  private updateEvent(eventId: string, eventData: any): void {
    this.eventsService.updateEvent(eventId, eventData).subscribe({
      next: (updatedEvent) => {
        if (updatedEvent) {
          this.event.set(updatedEvent);
          this.showMessage('Evento actualizado exitosamente');
        }
      },
      error: (error) => {
        console.error('Error updating event:', error);
        this.showMessage('Error al actualizar el evento', 'error');
      },
    });
  }

  onDeleteEvent(): void {
    const currentEvent = this.event();
    if (currentEvent) {
      this.modalService.openDeleteConfirmModal(currentEvent.name).subscribe({
        next: (confirmed) => {
          if (confirmed) {
            this.deleteEvent(currentEvent.id);
          }
        },
      });
    }
  }

  private deleteEvent(eventId: string): void {
    this.eventsService.deleteEvent(eventId).subscribe({
      next: (success) => {
        if (success) {
          this.showMessage('Evento eliminado correctamente');
          this.router.navigate(['/']);
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

  goBack(): void {
    this.router.navigate(['/']);
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

  // Getters para templates
  get eventId(): string | null {
    return this.event()?.id || null;
  }

  get debugInfo() {
    return {
      eventId: this.eventId,
      loading: this.loading(),
      error: this.error(),
      selectedTab: this.selectedTab(),
      eventStatus: this.eventStatus(),
      eventStats: this.eventStats(),
    };
  }
}
