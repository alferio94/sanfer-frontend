// src/app/features/events/components/event-transport-list/event-transport-list.component.ts
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
import { Transport } from '@core/models/transport.interface';
import { TransportService } from '@core/services/transport.service';
import { CreateTransportDto } from '@core/dtos/create-transport.dto';
import { CreateTransportModalComponent } from '@shared/components/modals/create-transport-modal/create-transport-modal.component';

@Component({
  selector: 'app-event-transport-list',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    ReusableTableComponent,
  ],
  templateUrl: './event-transport-list.component.html',
  styleUrls: ['./event-transport-list.component.scss'],
})
export class EventTransportListComponent implements OnInit {
  @Input({ required: true }) eventId!: string;

  private transportService = inject(TransportService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Signals
  readonly transports = signal<Transport[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Computed for sorted transport items (by departure time)
  readonly sortedTransports = computed(() => {
    const items = this.transports();
    return items.sort((a, b) => {
      const dateA = new Date(a.departureTime);
      const dateB = new Date(b.departureTime);
      return dateA.getTime() - dateB.getTime();
    });
  });

  // Table Configuration
  readonly tableColumns: TableColumn<Transport>[] = [
    {
      key: 'type',
      label: 'Tipo',
      sortable: false,
      width: '80px',
      align: 'center',
      type: 'custom',
    },
    {
      key: 'name',
      label: 'Nombre del Transporte',
      sortable: true,
      type: 'text',
    },
    {
      key: 'departureTime',
      label: 'Hora de Salida',
      sortable: true,
      width: '140px',
      type: 'custom',
    },
    {
      key: 'details',
      label: 'Detalles',
      sortable: false,
      type: 'text',
    },
    {
      key: 'groups',
      label: 'Grupos Asignados',
      sortable: false,
      width: '200px',
      type: 'custom',
    },
    {
      key: 'mapUrl',
      label: 'Mapa',
      sortable: false,
      width: '80px',
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
  };

  readonly tableActions: TableAction<Transport>[] = [
    {
      icon: 'edit',
      label: 'Editar transporte',
      color: 'primary',
      handler: (transport) => this.onEditTransport(transport),
    },
    {
      icon: 'delete',
      label: 'Eliminar transporte',
      color: 'warn',
      handler: (transport) => this.onDeleteTransport(transport),
    },
  ];

  ngOnInit(): void {
    this.loadTransports();
  }

  loadTransports(): void {
    this.loading.set(true);
    this.error.set(null);

    this.transportService.getTransportsByEvent(this.eventId).subscribe({
      next: (transports) => {
        this.transports.set(transports);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading transports:', error);
        this.error.set('Error al cargar los transportes');
        this.loading.set(false);
      },
    });
  }

  openCreateTransportModal(): void {
    const dialogRef = this.dialog.open(CreateTransportModalComponent, {
      width: '700px',
      data: { eventId: this.eventId, mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'create') {
        this.createTransport(result.data);
      }
    });
  }

  private createTransport(transportData: CreateTransportDto): void {
    this.transportService.createTransportForEvent(transportData).subscribe({
      next: (transport) => {
        if (transport) {
          this.showMessage('Transporte creado exitosamente');
          this.loadTransports();
        }
      },
      error: (error) => {
        console.error('Error creating transport:', error);
        this.showMessage('Error al crear el transporte', 'error');
      },
    });
  }

  onEditTransport(transport: Transport): void {
    const dialogRef = this.dialog.open(CreateTransportModalComponent, {
      width: '700px',
      data: {
        eventId: this.eventId,
        mode: 'edit',
        transport: transport,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'edit') {
        this.updateTransport(transport.id, result.data);
      }
    });
  }

  private updateTransport(transportId: string, transportData: any): void {
    this.transportService
      .updateTransport(transportId, transportData)
      .subscribe({
        next: (updatedTransport) => {
          if (updatedTransport) {
            this.showMessage('Transporte actualizado exitosamente');
            this.loadTransports();
          }
        },
        error: (error) => {
          console.error('Error updating transport:', error);
          this.showMessage('Error al actualizar el transporte', 'error');
        },
      });
  }

  onDeleteTransport(transport: Transport): void {
    if (
      confirm(
        `¿Estás seguro de que deseas eliminar el transporte "${transport.name}"?`,
      )
    ) {
      this.deleteTransport(transport.id);
    }
  }

  private deleteTransport(transportId: string): void {
    this.transportService.deleteTransport(transportId).subscribe({
      next: (success) => {
        if (success) {
          this.showMessage('Transporte eliminado correctamente');
        }
      },
      error: (error) => {
        console.error('Error deleting transport:', error);
        this.showMessage('Error al eliminar el transporte', 'error');
      },
    });
  }

  // Helper methods for table display
  getTransportIcon(type: string): string {
    const icons = {
      airplane: 'flight',
      bus: 'directions_bus',
      train: 'train',
      van: 'airport_shuttle',
      boat: 'directions_boat',
    };
    return icons[type as keyof typeof icons] || 'directions';
  }

  getTransportLabel(type: string): string {
    const labels = {
      airplane: 'Avión',
      bus: 'Autobús',
      train: 'Tren',
      van: 'Van',
      boat: 'Barco',
    };
    return labels[type as keyof typeof labels] || type;
  }

  formatDepartureTime(dateTime: Date): string {
    return new Date(dateTime).toLocaleString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Table event handlers
  onSortChange(sort: Sort): void {
    console.log('Sort changed:', sort);
  }

  onPageChange(event: PageEvent): void {
    console.log('Page changed:', event);
  }

  onRowClick(item: Transport): void {
    console.log('Row clicked:', item);
  }

  // Track by function para mejor performance
  trackByTransportId(index: number, transport: Transport): string {
    return transport.id;
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
}
