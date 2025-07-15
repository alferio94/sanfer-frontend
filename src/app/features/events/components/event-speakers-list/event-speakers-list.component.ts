// src/app/features/events/components/event-speakers-list/event-speakers-list.component.ts
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
import { Speaker } from '@core/models/speaker.interface';
import { SpeakersService } from '@core/services/speakers.service';
import { CreateSpeakerDto } from '@core/dtos/index';
import { CreateSpeakerModalComponent } from '@shared/components/modals/create-speaker-modal/create-speaker-modal.component';

@Component({
  selector: 'app-event-speakers-list',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    ReusableTableComponent,
  ],
  templateUrl: './event-speakers-list.component.html',
  styleUrls: ['./event-speakers-list.component.scss'],
})
export class EventSpeakersListComponent implements OnInit {
  @Input({ required: true }) eventId!: string;

  private speakersService = inject(SpeakersService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Signals
  readonly speakers = signal<Speaker[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Table Configuration
  readonly tableColumns: TableColumn<Speaker>[] = [
    {
      key: 'photoUrl',
      label: 'Foto',
      sortable: false,
      width: '80px',
      align: 'center',
      type: 'custom',
    },
    {
      key: 'name',
      label: 'Nombre del Speaker',
      sortable: true,
      type: 'text',
    },
    {
      key: 'presentation',
      label: 'Presentación',
      sortable: true,
      type: 'text',
    },
    {
      key: 'specialty',
      label: 'Especialidad',
      sortable: true,
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

  readonly tableActions: TableAction<Speaker>[] = [
    {
      icon: 'edit',
      label: 'Editar speaker',
      color: 'primary',
      handler: (speaker) => this.onEditSpeaker(speaker),
    },
    {
      icon: 'delete',
      label: 'Eliminar speaker',
      color: 'warn',
      handler: (speaker) => this.onDeleteSpeaker(speaker),
    },
  ];

  ngOnInit(): void {
    this.loadSpeakers();
  }

  loadSpeakers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.speakersService.getSpeakersByEvent(this.eventId).subscribe({
      next: (speakers) => {
        this.speakers.set(speakers);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading speakers:', error);
        this.error.set('Error al cargar los speakers');
        this.loading.set(false);
      },
    });
  }

  openCreateSpeakerModal(): void {
    const dialogRef = this.dialog.open(CreateSpeakerModalComponent, {
      width: '600px',
      data: { eventId: this.eventId, mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'create') {
        this.createSpeaker(result.data);
      }
    });
  }

  private createSpeaker(speakerData: CreateSpeakerDto): void {
    this.speakersService.createSpeakerForEvent(speakerData).subscribe({
      next: (speaker) => {
        if (speaker) {
          this.showMessage('Speaker creado exitosamente');
          this.loadSpeakers();
        }
      },
      error: (error) => {
        console.error('Error creating speaker:', error);
        this.showMessage('Error al crear el speaker', 'error');
      },
    });
  }

  onEditSpeaker(speaker: Speaker): void {
    const dialogRef = this.dialog.open(CreateSpeakerModalComponent, {
      width: '600px',
      data: {
        eventId: this.eventId,
        mode: 'edit',
        speaker: speaker,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'edit') {
        this.updateSpeaker(speaker.id, result.data);
      }
    });
  }

  private updateSpeaker(speakerId: string, speakerData: any): void {
    this.speakersService.updateSpeaker(speakerId, speakerData).subscribe({
      next: (updatedSpeaker) => {
        if (updatedSpeaker) {
          this.showMessage('Speaker actualizado exitosamente');
          this.loadSpeakers();
        }
      },
      error: (error) => {
        console.error('Error updating speaker:', error);
        this.showMessage('Error al actualizar el speaker', 'error');
      },
    });
  }

  onDeleteSpeaker(speaker: Speaker): void {
    if (
      confirm(
        `¿Estás seguro de que deseas eliminar al speaker "${speaker.name}"?`,
      )
    ) {
      this.deleteSpeaker(speaker.id);
    }
  }

  private deleteSpeaker(speakerId: string): void {
    this.speakersService.deleteSpeaker(speakerId).subscribe({
      next: (success) => {
        if (success) {
          this.showMessage('Speaker eliminado correctamente');
        }
      },
      error: (error) => {
        console.error('Error deleting speaker:', error);
        this.showMessage('Error al eliminar el speaker', 'error');
      },
    });
  }

  // Table event handlers
  onSortChange(sort: Sort): void {}

  onPageChange(event: PageEvent): void {}

  onRowClick(item: Speaker): void {}

  // Track by function para mejor performance
  trackBySpeakerId(index: number, speaker: Speaker): string {
    return speaker.id;
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
