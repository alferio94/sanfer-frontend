import { Component, Input, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';

// Reusable Table
import {
  ReusableTableComponent,
  TableColumn,
  TableConfig,
  TableAction,
} from '@shared/components/reusable-table/reusable-table.component';

// Models & Services
import { EventGroup } from '@core/models/group.interface';
import { GroupsService } from '@core/services/groups.service';
import { CreateEventGroupDto } from '@core/dtos';
import { CreateGroupModalComponent } from '@shared/components/modals/create-group-modal/create-group-modal.component';
@Component({
  selector: 'app-event-group-list',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ReusableTableComponent,
  ],
  templateUrl: './event-group-list.component.html',
  styleUrl: './event-group-list.component.scss',
})
export class EventGroupListComponent {
  @Input({ required: true }) eventId!: string;
  @Input({ required: true }) eventGroups!: EventGroup[];

  private groupsService = inject(GroupsService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Signals
  readonly groups = signal<EventGroup[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Table Configuration
  readonly tableColumns: TableColumn<EventGroup>[] = [
    {
      key: 'color',
      label: 'Color',
      sortable: false,
      width: '80px',
      align: 'center',
      type: 'custom',
    },
    {
      key: 'name',
      label: 'Nombre del Grupo',
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

  readonly tableActions: TableAction<EventGroup>[] = [
    {
      icon: 'edit',
      label: 'Editar grupo',
      color: 'primary',
      handler: (group) => this.onEditGroup(group),
    },
    {
      icon: 'delete',
      label: 'Eliminar grupo',
      color: 'warn',
      handler: (group) => this.onDeleteGroup(group),
    },
  ];
  // sum: (previousValue: EventGroup,currentValue: EventGroup,currentIndex: number,array: EventGroup[]) => EventGroup;

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading.set(true);
    this.error.set(null);

    this.groupsService.getGroupsByEvent(this.eventId).subscribe({
      next: (groups) => {
        this.groups.set(groups);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        this.error.set('Error al cargar los grupos');
        this.loading.set(false);
      },
    });
  }

  openCreateGroupModal(): void {
    const dialogRef = this.dialog.open(CreateGroupModalComponent, {
      width: '500px',
      data: { eventId: this.eventId, mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'create') {
        this.createGroup(result.data);
      }
    });
  }

  private createGroup(groupData: CreateEventGroupDto): void {
    this.groupsService.createGroupForEvent(this.eventId, groupData).subscribe({
      next: (group) => {
        if (group) {
          const currentGroups = this.groups();
          this.groups.set([...currentGroups, group]);
          this.showMessage('Grupo creado exitosamente');
        }
      },
      error: (error) => {
        console.error('Error creating group:', error);
        this.showMessage('Error al crear el grupo', 'error');
      },
    });
  }

  onEditGroup(group: EventGroup): void {
    const dialogRef = this.dialog.open(CreateGroupModalComponent, {
      width: '500px',
      data: { mode: 'edit', group },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'edit') {
        this.updateGroup(group.id, result.data);
      }
    });
  }

  private updateGroup(groupId: string, groupData: any): void {
    this.groupsService.updateGroup(groupId, groupData).subscribe({
      next: (updatedGroup) => {
        if (updatedGroup) {
          const currentGroups = this.groups();
          const updatedGroups = currentGroups.map((g) =>
            g.id === groupId ? updatedGroup : g,
          );
          this.groups.set(updatedGroups);
          this.showMessage('Grupo actualizado exitosamente');
        }
      },
      error: (error) => {
        console.error('Error updating group:', error);
        this.showMessage('Error al actualizar el grupo', 'error');
      },
    });
  }

  onDeleteGroup(group: EventGroup): void {
    if (
      confirm(`¿Estás seguro de que deseas eliminar el grupo "${group.name}"?`)
    ) {
      this.deleteGroup(group.id);
    }
  }

  private deleteGroup(groupId: string): void {
    this.groupsService.deleteGroup(groupId).subscribe({
      next: (success) => {
        if (success) {
          const currentGroups = this.groups();
          const filteredGroups = currentGroups.filter((g) => g.id !== groupId);
          this.groups.set(filteredGroups);
          this.showMessage('Grupo eliminado correctamente');
        }
      },
      error: (error) => {
        console.error('Error deleting group:', error);
        this.showMessage('Error al eliminar el grupo', 'error');
      },
    });
  }

  // Table event handlers
  onSortChange(sort: Sort): void {
    // Aquí puedes implementar lógica adicional si necesitas
  }

  onPageChange(event: PageEvent): void {
    // Aquí puedes implementar lógica adicional si necesitas
  }

  onRowClick(group: EventGroup): void {
    // Podrías abrir un modal de detalles o navegar a otra página
  }

  // Track by function para mejor performance
  trackByGroupId(index: number, group: EventGroup): string {
    return group.id;
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
