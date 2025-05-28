// src/app/core/services/modal.service.ts
import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';

// Models
import { AppEvent } from '../models/event.interface';
import { CreateEventDto } from '../dtos';

// Modal components (will be imported dynamically)
interface CreateEventModalData {
  mode: 'create' | 'edit';
  event?: AppEvent;
}

interface CreateEventModalResult {
  action: 'create' | 'edit' | 'cancel';
  data?: CreateEventDto;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private dialog = inject(MatDialog);

  /**
   * Abre modal para crear evento
   */
  openCreateEventModal(): Observable<CreateEventModalResult | undefined> {
    return this.openEventModal({ mode: 'create' });
  }

  /**
   * Abre modal para editar evento
   */
  openEditEventModal(
    event: AppEvent,
  ): Observable<CreateEventModalResult | undefined> {
    return this.openEventModal({ mode: 'edit', event });
  }

  /**
   * Abre modal de evento (crear o editar)
   */
  private openEventModal(
    data: CreateEventModalData,
  ): Observable<CreateEventModalResult | undefined> {
    // Dynamic import para mejor performance
    return new Observable((observer) => {
      import(
        '../../shared/components/modals/create-event-modal/create-event-modal.component'
      )
        .then((m) => {
          const dialogRef: MatDialogRef<any, CreateEventModalResult> =
            this.dialog.open(m.CreateEventModalComponent, {
              width: '600px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              data: data,
              disableClose: false,
              autoFocus: true,
              restoreFocus: true,
              panelClass: 'sanfer-modal',
            });

          dialogRef.afterClosed().subscribe((result) => {
            observer.next(result);
            observer.complete();
          });
        })
        .catch((error) => {
          console.error('Error loading create event modal:', error);
          observer.error(error);
        });
    });
  }

  /**
   * Abre modal de confirmación de eliminación
   */
  openDeleteConfirmModal(eventName: string): Observable<boolean> {
    return new Observable((observer) => {
      import(
        '../../shared/components/modals/confirm-modal/confirm-modal.component'
      )
        .then((m) => {
          const dialogRef = this.dialog.open(m.ConfirmModalComponent, {
            width: '400px',
            data: {
              title: 'Eliminar Evento',
              message: `¿Estás seguro de que deseas eliminar el evento "${eventName}"?`,
              confirmText: 'Eliminar',
              cancelText: 'Cancelar',
              type: 'danger',
            },
            panelClass: 'sanfer-modal',
          });

          dialogRef.afterClosed().subscribe((result) => {
            observer.next(!!result);
            observer.complete();
          });
        })
        .catch((error) => {
          console.error('Error loading confirm modal:', error);
          observer.next(false);
          observer.complete();
        });
    });
  }

  /**
   * Cierra todos los modales abiertos
   */
  closeAllModals(): void {
    this.dialog.closeAll();
  }

  /**
   * Verifica si hay modales abiertos
   */
  hasOpenModals(): boolean {
    return this.dialog.openDialogs.length > 0;
  }

  // Métodos para futuros modales de grupos, usuarios, agenda, etc.

  /**
   * Abre modal para crear grupo (implementar más tarde)
   */
  openCreateGroupModal(eventId: string): Observable<any> {
    // TODO: Implementar cuando creemos el modal de grupos
    return new Observable((observer) => {
      observer.next(null);
      observer.complete();
    });
  }

  /**
   * Abre modal para asignar usuarios (implementar más tarde)
   */
  openAssignUsersModal(eventId: string): Observable<any> {
    // TODO: Implementar cuando creemos el modal de usuarios
    return new Observable((observer) => {
      observer.next(null);
      observer.complete();
    });
  }

  /**
   * Abre modal para crear actividad de agenda (implementar más tarde)
   */
  openCreateAgendaModal(eventId: string): Observable<any> {
    // TODO: Implementar cuando creemos el modal de agenda
    return new Observable((observer) => {
      observer.next(null);
      observer.complete();
    });
  }
}
