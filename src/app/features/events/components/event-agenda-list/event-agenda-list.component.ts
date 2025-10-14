// src/app/features/events/components/event-agenda-list/event-agenda-list.component.ts
import {
  Component,
  Input,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';

// Reusable Table
import {
  ReusableTableComponent,
  TableColumn,
  TableConfig,
  TableAction,
} from '../../../../shared/components/reusable-table/reusable-table.component';

// Models & Services
import { EventAgenda } from '@core/models/agenda.interface';
import { AgendaService } from '@core/services/agenda.service';
import { EventsService } from '@core/services/events.service';
import { CreateEventAgendumDto } from '@core/dtos';
import { CreateAgendaModalComponent } from '@shared/components/modals/create-agenda-modal/create-agenda-modal.component';

@Component({
  selector: 'app-event-agenda-list',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    ReusableTableComponent,
  ],
  templateUrl: './event-agenda-list.component.html',
  styleUrl: './event-agenda-list.component.scss',
})
export class EventAgendaListComponent implements OnInit {
  @Input({ required: true }) eventId!: string;
  @Input() eventStartDate?: Date;
  @Input() eventEndDate?: Date;

  private agendaService = inject(AgendaService);
  private eventsService = inject(EventsService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Signals
  readonly agendaItems = signal<EventAgenda[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Computed for sorted agenda items (by date/time)
  readonly sortedAgendaItems = computed(() => {
    const items = this.agendaItems();
    return items.sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return dateA.getTime() - dateB.getTime();
    });
  });

  // Table Configuration
  readonly tableColumns: TableColumn<EventAgenda>[] = [
    {
      key: 'title',
      label: 'Actividad',
      sortable: true,
      type: 'text',
    },
    {
      key: 'startDate',
      label: 'Fecha',
      sortable: true,
      width: '120px',
      type: 'custom',
    },
    {
      key: 'startTime',
      label: 'Hora',
      sortable: true,
      width: '100px',
      type: 'custom',
    },
    {
      key: 'duration',
      label: 'Duración',
      sortable: false,
      width: '90px',
      type: 'custom',
    },
    {
      key: 'location',
      label: 'Ubicación',
      sortable: true,
      width: '150px',
      type: 'text',
    },
    {
      key: 'groups',
      label: 'Grupos',
      sortable: false,
      width: '200px',
      type: 'custom',
    },
  ];

  readonly tableConfig: TableConfig = {
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25],
    showFirstLastButtons: true,
    sortable: true,
    stickyHeader: false,
    showFilter: true,
  };

  readonly tableActions: TableAction<EventAgenda>[] = [
    {
      icon: 'edit',
      label: 'Editar actividad',
      color: 'primary',
      handler: (item) => this.onEditAgendaItem(item),
    },
    {
      icon: 'delete',
      label: 'Eliminar actividad',
      color: 'warn',
      handler: (item) => this.onDeleteAgendaItem(item),
    },
  ];

  ngOnInit(): void {
    this.loadAgendaItems();
  }

  loadAgendaItems(): void {
    this.loading.set(true);
    this.error.set(null);

    // Get event with agenda items
    this.agendaService.getAgendaByEvent(this.eventId).subscribe({
      next: (agendas) => {
        this.agendaItems.set(agendas);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading agenda items:', error);
        this.error.set('Error al cargar la agenda');
        this.loading.set(false);
      },
    });
  }

  openCreateAgendaModal(): void {
    const dialogRef = this.dialog.open(CreateAgendaModalComponent, {
      width: '600px',
      data: {
        eventId: this.eventId,
        mode: 'create',
        eventStartDate: this.eventStartDate,
        eventEndDate: this.eventEndDate,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'create') {
        this.createAgendaItem(result.data);
      }
    });
  }

  private createAgendaItem(agendaData: CreateEventAgendumDto): void {
    this.agendaService.createAgendaItem(agendaData).subscribe({
      next: (agendaItem) => {
        if (agendaItem) {
          const currentItems = this.agendaItems();
          this.agendaItems.set([...currentItems, agendaItem]);
          this.showMessage('Actividad creada exitosamente');
        }
      },
      error: (error) => {
        console.error('Error creating agenda item:', error);
        this.showMessage('Error al crear la actividad', 'error');
      },
    });
  }

  onEditAgendaItem(item: EventAgenda): void {
    const dialogRef = this.dialog.open(CreateAgendaModalComponent, {
      width: '600px',
      data: {
        eventId: this.eventId,
        mode: 'edit',
        agendaItem: item,
        eventStartDate: this.eventStartDate,
        eventEndDate: this.eventEndDate,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'edit') {
        this.updateAgendaItem(item.id, result.data);
      }
    });
  }

  private updateAgendaItem(itemId: string, agendaData: any): void {
    this.agendaService.updateAgendaItem(itemId, agendaData).subscribe({
      next: (updatedItem) => {
        if (updatedItem) {
          const currentItems = this.agendaItems();
          const updatedItems = currentItems.map((item) =>
            item.id === itemId ? updatedItem : item,
          );
          this.agendaItems.set(updatedItems);
          this.showMessage('Actividad actualizada exitosamente');
        }
      },
      error: (error) => {
        console.error('Error updating agenda item:', error);
        this.showMessage('Error al actualizar la actividad', 'error');
      },
    });
  }

  onDeleteAgendaItem(item: EventAgenda): void {
    if (
      confirm(
        `¿Estás seguro de que deseas eliminar la actividad "${item.title}"?`,
      )
    ) {
      this.deleteAgendaItem(item.id);
    }
  }

  private deleteAgendaItem(itemId: string): void {
    this.agendaService.deleteAgendaItem(itemId).subscribe({
      next: (success) => {
        if (success) {
          const currentItems = this.agendaItems();
          const filteredItems = currentItems.filter(
            (item) => item.id !== itemId,
          );
          this.agendaItems.set(filteredItems);
          this.showMessage('Actividad eliminada correctamente');
        }
      },
      error: (error) => {
        console.error('Error deleting agenda item:', error);
        this.showMessage('Error al eliminar la actividad', 'error');
      },
    });
  }

  // Table event handlers
  onSortChange(sort: Sort): void {}

  onPageChange(event: PageEvent): void {}

  onRowClick(item: EventAgenda): void {}

  // Helper methods for table display
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatDuration(startDate: Date, endDate: Date): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
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

  // Track by function para mejor performance
  trackByAgendaId(index: number, item: EventAgenda): string {
    return item.id;
  }
}
