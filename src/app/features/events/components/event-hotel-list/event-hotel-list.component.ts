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
import { MatTooltipModule } from '@angular/material/tooltip';

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
import { ImageViewModalComponent } from '@shared/components/modals/image-view-modal/image-view-modal.component';

// Image Cropper
import { ImageUtilsService } from '@shared/services/image-utils.service';
import { IMAGE_CROPPER_PRESETS } from '@shared/components/image-cropper-modal';
import { FirebaseStorageService } from '@shared/services/firebase-storage.service';

@Component({
  selector: 'app-event-hotel-list',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    ReusableTableComponent,
  ],
  templateUrl: './event-hotel-list.component.html',
  styleUrl: './event-hotel-list.component.scss',
})
export class EventHotelListComponent implements OnInit {
  @Input({ required: true }) eventId!: string;

  private hotelsService = inject(HotelsService);
  private firebaseStorage = inject(FirebaseStorageService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private imageUtilsService = inject(ImageUtilsService);

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
      key: 'photoUrl',
      label: 'Ver Imagen',
      sortable: false,
      type: 'custom',
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
      icon: 'add_photo_alternate',
      label: 'Agregar imagen',
      color: 'accent',
      handler: (hotel) => this.onAddHotelImage(hotel),
    },
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

  onPageChange(event: PageEvent): void {}

  onRowClick(item: Hotel): void {}

  // Image handling
  async onAddHotelImage(hotel: Hotel): Promise<void> {
    try {
      const result = await this.imageUtilsService.openImageCropper(
        IMAGE_CROPPER_PRESETS.BANNER
      ).toPromise();
      
      if (result && result.blob) {
        // Subir imagen recortada a Firebase Storage
        const uploadResult = await this.firebaseStorage.uploadFile(
          result.blob,
          'hoteles',
          hotel.id,
          'jpg'
        ).toPromise();
        
        if (uploadResult) {
          // Log del download URL
          console.log('Hotel image uploaded successfully. Download URL:', uploadResult.downloadURL);
          
          // Actualizar hotel con la nueva URL
          await this.updateHotelImage(hotel.id, uploadResult.downloadURL);
          
          this.showMessage('Imagen del hotel actualizada exitosamente');
        }
      }
    } catch (error) {
      console.error('Error adding hotel image:', error);
      this.showMessage('Error al agregar la imagen', 'error');
    }
  }

  private async updateHotelImage(hotelId: string, photoUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.hotelsService.updateHotel(hotelId, { photoUrl }).subscribe({
        next: (updatedHotel) => {
          if (updatedHotel) {
            this.loadHotels(); // Reload to show updated image
            resolve();
          } else {
            reject(new Error('No updated hotel returned'));
          }
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  // Track by function para mejor performance
  trackByHotelId(index: number, hotel: Hotel): string {
    return hotel.id;
  }

  // Ver imagen del hotel
  onViewHotelImage(hotel: Hotel): void {
    if (!hotel.photoUrl) {
      this.showMessage('Este hotel no tiene imagen', 'error');
      return;
    }

    // Crear modal para mostrar la imagen
    const dialogRef = this.dialog.open(ImageViewModalComponent, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: {
        imageUrl: hotel.photoUrl,
        title: `Imagen de ${hotel.name}`,
        altText: hotel.name
      }
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
}
