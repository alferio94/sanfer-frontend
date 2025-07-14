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
import { Hotel } from '@core/models/hotel.interface';
import { HotelsService } from '@core/services/hotel.service';
import { CreateHotelDto } from '@core/dtos/create-hotel.dto';
import { CreateHotelModalComponent } from '@shared/components/modals/create-hotel-modal/create-hotel-modal.component';

@Component({
  selector: 'app-event-hotel-list',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    ReusableTableComponent,
  ],
  templateUrl: './event-hotel-list.component.html',
  styleUrl: './event-hotel-list.component.scss',
})
export class EventHotelListComponent implements OnInit {
  @Input({ required: true }) eventId!: string;

  private hotelsService = inject(HotelsService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Signals
  readonly hotels = signal<Hotel[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Table Configuration
  readonly tableColumns: TableColumn<Hotel>[] = [
    {
      key: 'name',
      label: 'Nombre del Hotel',
      sortable: true,
      type: 'text',
    },
    {
      key: 'address',
      label: 'Dirección',
      sortable: true,
      type: 'text',
    },
    {
      key: 'phone',
      label: 'Teléfono',
      sortable: true,
      type: 'text',
    },
    {
      key: 'mapUrl',
      label: 'Mapa',
      sortable: false,
      type: 'text',
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

  readonly tableActions: TableAction<Hotel>[] = [
    {
      icon: 'edit',
      label: 'Editar hotel',
      color: 'primary',
      handler: (hotel) => this.onEditHotel(hotel),
    },
    {
      icon: 'delete',
      label: 'Eliminar hotel',
      color: 'warn',
      handler: (hotel) => this.onDeleteHotel(hotel),
    },
  ];

  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels(): void {
    this.loading.set(true);
    this.error.set(null);
    this.hotelsService.getHotelsByEvent(this.eventId).subscribe({
      next: (hotels) => {
        this.hotels.set(hotels);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading hotels:', error);
        this.error.set('Error al cargar los hoteles');
        this.loading.set(false);
      },
    });
  }

  openCreateHotelModal(): void {
    const dialogRef = this.dialog.open(CreateHotelModalComponent, {
      width: '600px',
      data: { eventId: this.eventId, mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'create') {
        this.createHotel(result.data);
      }
    });
  }

  private createHotel(hotelData: CreateHotelDto): void {
    this.hotelsService.createHotelForEvent(hotelData).subscribe({
      next: (hotel) => {
        if (hotel) {
          this.showMessage('Hotel creado exitosamente');
          this.loadHotels();
        }
      },
      error: (error) => {
        console.error('Error creating hotel:', error);
        this.showMessage('Error al crear el hotel', 'error');
      },
    });
  }

  onEditHotel(hotel: Hotel): void {
    const dialogRef = this.dialog.open(CreateHotelModalComponent, {
      width: '600px',
      data: {
        eventId: this.eventId,
        mode: 'edit',
        hotel: hotel,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'edit') {
        this.updateHotel(hotel.id, result.data);
      }
    });
  }

  private updateHotel(hotelId: string, hotelData: any): void {
    this.hotelsService.updateHotel(hotelId, hotelData).subscribe({
      next: (updatedHotel) => {
        if (updatedHotel) {
          this.showMessage('Hotel actualizado exitosamente');
          this.loadHotels();
        }
      },
      error: (error) => {
        console.error('Error updating hotel:', error);
        this.showMessage('Error al actualizar el hotel', 'error');
      },
    });
  }

  onDeleteHotel(hotel: Hotel): void {
    if (
      confirm(`¿Estás seguro de que deseas eliminar el hotel "${hotel.name}"?`)
    ) {
      this.deleteHotel(hotel.id);
    }
  }

  private deleteHotel(hotelId: string): void {
    this.hotelsService.deleteHotel(hotelId).subscribe({
      next: (success) => {
        if (success) {
          this.showMessage('Hotel eliminado correctamente');
        }
      },
      error: (error) => {
        console.error('Error deleting hotel:', error);
        this.showMessage('Error al eliminar el hotel', 'error');
      },
    });
  }

  // Table event handlers
  onSortChange(sort: Sort): void {}

  onPageChange(event: PageEvent): void {
    console.log('Page changed:', event);
  }

  onRowClick(item: Hotel): void {
    console.log('Row clicked:', item);
  }

  // Track by function para mejor performance
  trackByHotelId(index: number, hotel: Hotel): string {
    return hotel.id;
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
