import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';

import { EventGroup, EventUser } from '@core/models';
import { UsersService } from '@core/services/users.service';
import {
  ReusableTableComponent,
  TableAction,
  TableColumn,
  TableConfig,
} from '@shared/components/reusable-table/reusable-table.component';
import { MatChipsModule } from '@angular/material/chips';
import { BulkUsersModalComponent } from '@shared/components/modals/bulk-users-modal/bulk-users-modal.component';
import { CreateEventUserModalComponent } from '@shared/components/modals/create-event-user-modal/create-event-user-modal.component';
import { ConfirmDeleteUserDialogComponent } from '@shared/components/dialogs/confirm-delete-user-dialog/confirm-delete-user-dialog.component';
import { EventsService } from '@core/services/events.service';
import { MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-event-users-list',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    ReusableTableComponent,
  ],
  templateUrl: './event-users-list.component.html',
  styleUrl: './event-users-list.component.scss',
})
export class EventUsersListComponent implements OnInit {
  @Input({ required: true }) eventId!: string;

  private readonly usersService = inject(UsersService);
  private readonly eventsService = inject(EventsService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  readonly users = signal<EventUser[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly tableColumns: TableColumn<EventUser>[] = [
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
      align: 'left',
      type: 'text',
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      align: 'left',
      type: 'text',
    },
    {
      key: 'assignedGroups',
      label: 'Grupos Asignados',
      sortable: false,
      align: 'left',
      type: 'custom',
    },
  ];

  readonly tableConfig: TableConfig = {
    showPagination: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 20],
    showFirstLastButtons: true,
    sortable: true,
    stickyHeader: false,
    showFilter: true,
  };

  readonly tableActions: TableAction<EventUser>[] = [
    // {
    //   icon: 'edit',
    //   label: 'Editar grupo',
    //   color: 'primary',
    //   handler: (user) => this.onEditUser(user),
    // },
    {
      icon: 'delete',
      label: 'Eliminar usuario',
      color: 'warn',
      handler: (user) => this.onDeleteUser(user),
    },
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);
    this.usersService.gerUserAssigments(this.eventId).subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.error.set('Error al cargar los usuarios');
        this.loading.set(false);
      },
    });
  }

  openBulkUsersUploadModal(): void {
    const dialogRef = this.dialog.open(BulkUsersModalComponent, {
      width: '600px',
      data: { eventId: this.eventId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'upload') {
        this.loadUsers();
        this.showMessage(
          `Se han cargado ${result.usersCount} usuarios correctamente.`,
          'success',
        );
      }
    });
  }

  onEditUser(user: EventUser): void {}

  onDeleteUser(user: EventUser): void {
    const dialogRef = this.dialog.open(ConfirmDeleteUserDialogComponent, {
      width: '400px',
      data: {
        userName: user.name,
        userEmail: user.email,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        this.deleteUser(user);
      }
    });
  }

  private deleteUser(user: EventUser): void {
    this.loading.set(true);

    this.eventsService.removeUserFromEvent(this.eventId, user.id).subscribe({
      next: () => {
        this.loadUsers();
        this.showMessage(
          `Usuario ${user.name} eliminado del evento exitosamente`,
          'success',
        );
      },
      error: (error) => {
        console.error('Error removing user from event:', error);
        this.loading.set(false);

        let errorMessage = 'Error al eliminar el usuario del evento';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 404) {
          errorMessage = 'Usuario no encontrado en este evento';
        }

        this.showMessage(errorMessage, 'error');
      },
    });
  }

  openCreateUserModal(): void {
    const dialogConfig: MatDialogConfig = {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { eventId: this.eventId },
      disableClose: true,
    };

    const dialogRef = this.dialog.open(
      CreateEventUserModalComponent,
      dialogConfig,
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'created') {
        this.loadUsers();
        this.showMessage(
          `Usuario ${result.user.name} creado y asignado al evento exitosamente`,
          'success',
        );
      }
    });
  }

  getGroupsNames(groups: EventGroup[]) {
    return groups.map((group) => group.name).join(', ');
  }

  // Table event handlers
  onSortChange(sort: Sort): void {
    // Aquí puedes implementar lógica adicional si necesitas
  }

  onPageChange(event: PageEvent): void {
    // Aquí puedes implementar lógica adicional si necesitas
  }

  onRowClick(group: EventUser): void {
    // Podrías abrir un modal de detalles o navegar a otra página
  }
  trackByUserId(index: number, user: EventUser): string {
    return user.id;
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
