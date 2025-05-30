// src/app/shared/components/modals/create-agenda-modal/create-agenda-modal.component.ts
import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

// Material imports
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';

// Models & Services
import { EventAgenda } from '@core/models/agenda.interface';
import { EventGroup } from '@core/models/group.interface';
import { CreateEventAgendumDto } from '@core/dtos';
import { GroupsService } from '@core/services/groups.service';

interface CreateAgendaModalData {
  eventId: string;
  mode: 'create' | 'edit';
  agendaItem?: EventAgenda;
}

interface CreateAgendaModalResult {
  action: 'create' | 'edit' | 'cancel';
  data?: CreateEventAgendumDto;
}

@Component({
  selector: 'app-create-agenda-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatDividerModule,
  ],
  templateUrl: './create-agenda-modal.component.html',
  styleUrl: './create-agenda-modal.component.scss',
})
export class CreateAgendaModalComponent implements OnInit {
  agendaForm: FormGroup;
  loading = signal(false);
  loadingGroups = signal(false);

  // Groups
  readonly availableGroups = signal<EventGroup[]>([]);
  readonly selectedGroups = signal<Set<string>>(new Set());

  constructor(
    private fb: FormBuilder,
    private groupsService: GroupsService,
    private dialogRef: MatDialogRef<
      CreateAgendaModalComponent,
      CreateAgendaModalResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: CreateAgendaModalData,
  ) {
    this.agendaForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadGroups();

    if (this.isEditMode && this.data.agendaItem) {
      this.loadAgendaData(this.data.agendaItem);
    }
  }

  // Getters
  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  private createForm(): FormGroup {
    return this.fb.group(
      {
        title: ['', [Validators.required, Validators.minLength(3)]],
        description: [''],
        location: [''],
        startDate: ['', Validators.required],
        startTime: ['', Validators.required],
        endDate: ['', Validators.required],
        endTime: ['', Validators.required],
      },
      {
        validators: [this.dateTimeRangeValidator()],
      },
    );
  }

  private loadGroups(): void {
    this.loadingGroups.set(true);

    this.groupsService.getGroupsByEvent(this.data.eventId).subscribe({
      next: (groups) => {
        this.availableGroups.set(groups);
        this.loadingGroups.set(false);
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        this.loadingGroups.set(false);
      },
    });
  }

  private loadAgendaData(agendaItem: EventAgenda): void {
    const startDate = new Date(agendaItem.startDate);
    const endDate = new Date(agendaItem.endDate);

    // Para MatTimepicker, necesitamos crear objetos Date con solo la hora
    const startTime = new Date();
    startTime.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);

    const endTime = new Date();
    endTime.setHours(endDate.getHours(), endDate.getMinutes(), 0, 0);

    this.agendaForm.patchValue({
      title: agendaItem.title,
      description: agendaItem.description || '',
      location: agendaItem.location || '',
      startDate: startDate,
      startTime: startTime,
      endDate: endDate,
      endTime: endTime,
    });

    // Preseleccionar grupos
    if (agendaItem.groups) {
      const selectedGroupIds = new Set(agendaItem.groups.map((g) => g.id));
      this.selectedGroups.set(selectedGroupIds);
    }
  }

  private dateTimeRangeValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control as FormGroup;
      const startDate = formGroup.get('startDate')?.value;
      const startTime = formGroup.get('startTime')?.value;
      const endDate = formGroup.get('endDate')?.value;
      const endTime = formGroup.get('endTime')?.value;

      if (startDate && startTime && endDate && endTime) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Manejar diferentes formatos de tiempo
        if (startTime instanceof Date) {
          start.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
        } else if (typeof startTime === 'string') {
          const [startHours, startMinutes] = startTime.split(':').map(Number);
          start.setHours(startHours, startMinutes, 0, 0);
        }

        if (endTime instanceof Date) {
          end.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
        } else if (typeof endTime === 'string') {
          const [endHours, endMinutes] = endTime.split(':').map(Number);
          end.setHours(endHours, endMinutes, 0, 0);
        }

        if (end <= start) {
          return { dateTimeRange: true };
        }
      }

      return null;
    };
  }

  // Group management
  onGroupToggle(groupId: string, checked: boolean): void {
    const selected = new Set(this.selectedGroups());

    if (checked) {
      selected.add(groupId);
    } else {
      selected.delete(groupId);
    }

    this.selectedGroups.set(selected);
  }

  isGroupSelected(groupId: string): boolean {
    return this.selectedGroups().has(groupId);
  }

  toggleAllGroups(): void {
    const allGroups = this.availableGroups();
    const currentSelected = this.selectedGroups();

    if (currentSelected.size === allGroups.length) {
      // Deseleccionar todos
      this.selectedGroups.set(new Set());
    } else {
      // Seleccionar todos
      this.selectedGroups.set(new Set(allGroups.map((g) => g.id)));
    }
  }

  get isAllGroupsSelected(): boolean {
    return this.selectedGroups().size === this.availableGroups().length;
  }

  get isSomeGroupsSelected(): boolean {
    const selected = this.selectedGroups().size;
    return selected > 0 && selected < this.availableGroups().length;
  }

  // DateTime helpers
  getStartDateTime(): Date | null {
    const date = this.agendaForm.get('startDate')?.value;
    const time = this.agendaForm.get('startTime')?.value;

    if (date && time) {
      const combined = new Date(date);
      if (time instanceof Date) {
        combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
      } else if (typeof time === 'string') {
        const [hours, minutes] = time.split(':').map(Number);
        combined.setHours(hours, minutes, 0, 0);
      }
      return combined;
    }
    return null;
  }

  getEndDateTime(): Date | null {
    const date = this.agendaForm.get('endDate')?.value;
    const time = this.agendaForm.get('endTime')?.value;

    if (date && time) {
      const combined = new Date(date);
      if (time instanceof Date) {
        combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
      } else if (typeof time === 'string') {
        const [hours, minutes] = time.split(':').map(Number);
        combined.setHours(hours, minutes, 0, 0);
      }
      return combined;
    }
    return null;
  }

  getDuration(): string {
    const start = this.getStartDateTime();
    const end = this.getEndDateTime();

    if (!start || !end) return '';

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    const parts: string[] = [];

    if (diffDays > 0) {
      parts.push(`${diffDays} día${diffDays !== 1 ? 's' : ''}`);
    }

    if (diffHours > 0) {
      parts.push(`${diffHours} hora${diffHours !== 1 ? 's' : ''}`);
    }

    if (diffMinutes > 0 && diffDays === 0) {
      parts.push(`${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`);
    }

    return parts.join(', ') || '0 minutos';
  }

  onSubmit(): void {
    if (this.agendaForm.valid && !this.loading()) {
      this.loading.set(true);

      const start = this.getStartDateTime();
      const end = this.getEndDateTime();

      if (!start || !end) {
        this.loading.set(false);
        return;
      }

      const agendaData: CreateEventAgendumDto = {
        title: this.agendaForm.get('title')?.value.trim(),
        description:
          this.agendaForm.get('description')?.value?.trim() || undefined,
        location: this.agendaForm.get('location')?.value?.trim() || undefined,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        eventId: this.data.eventId,
        groupIds: Array.from(this.selectedGroups()),
      };

      // Simular delay de API
      setTimeout(() => {
        this.loading.set(false);
        const result: CreateAgendaModalResult = {
          action: this.isEditMode ? 'edit' : 'create',
          data: agendaData,
        };
        this.dialogRef.close(result);
      }, 800);
    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.markFormGroupTouched(this.agendaForm);
    }
  }

  onCancel(): void {
    const result: CreateAgendaModalResult = {
      action: 'cancel',
    };
    this.dialogRef.close(result);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
