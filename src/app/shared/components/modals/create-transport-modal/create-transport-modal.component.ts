// src/app/shared/components/modals/create-transport-modal/create-transport-modal.component.ts
import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

// Material imports
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';

// Models & Services
import { Transport, TransportType } from '@core/models/transport.interface';
import { EventGroup } from '@core/models/group.interface';
import { CreateTransportDto } from '@core/dtos/create-transport.dto';
import { GroupsService } from '@core/services/groups.service';

interface CreateTransportModalData {
  eventId: string;
  mode: 'create' | 'edit';
  transport?: Transport;
}

interface CreateTransportModalResult {
  action: 'create' | 'edit' | 'cancel';
  data?: CreateTransportDto;
}

@Component({
  selector: 'app-create-transport-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatDividerModule,
  ],
  templateUrl: './create-transport-modal.component.html',
  styleUrls: ['./create-transport-modal.component.scss'],
})
export class CreateTransportModalComponent implements OnInit {
  transportForm: FormGroup;
  loading = signal(false);
  loadingGroups = signal(false);

  // Groups
  readonly availableGroups = signal<EventGroup[]>([]);
  readonly selectedGroups = signal<Set<string>>(new Set());

  // Transport types
  readonly transportTypes = [
    { value: 'airplane' as TransportType, label: 'Avión', icon: 'flight' },
    { value: 'bus' as TransportType, label: 'Autobús', icon: 'directions_bus' },
    { value: 'train' as TransportType, label: 'Tren', icon: 'train' },
    { value: 'van' as TransportType, label: 'Van', icon: 'airport_shuttle' },
    { value: 'boat' as TransportType, label: 'Barco', icon: 'directions_boat' },
  ];

  constructor(
    private fb: FormBuilder,
    private groupsService: GroupsService,
    private dialogRef: MatDialogRef<
      CreateTransportModalComponent,
      CreateTransportModalResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: CreateTransportModalData,
  ) {
    this.transportForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadGroups();

    if (this.isEditMode && this.data.transport) {
      this.loadTransportData(this.data.transport);
    }
  }

  // Getters
  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: ['', Validators.required],
      details: ['', [Validators.required, Validators.minLength(10)]],
      departureDate: ['', Validators.required],
      departureTime: ['', Validators.required],
      mapUrl: ['', [Validators.pattern(/^https?:\/\/\S+/)]],
    });
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

  private loadTransportData(transport: Transport): void {
    const departureDate = new Date(transport.departureTime);

    // Para MatTimepicker, necesitamos crear objetos Date con solo la hora
    const departureTime = new Date();
    departureTime.setHours(
      departureDate.getHours(),
      departureDate.getMinutes(),
      0,
      0,
    );

    this.transportForm.patchValue({
      name: transport.name,
      type: transport.type,
      details: transport.details,
      departureDate: departureDate,
      departureTime: departureTime,
      mapUrl: transport.mapUrl || '',
    });

    // Preseleccionar grupos
    if (transport.groups) {
      const selectedGroupIds = new Set(transport.groups.map((g) => g.id));
      this.selectedGroups.set(selectedGroupIds);
    }
  }

  getSelectedTypeIcon(): string {
    const selectedType = this.transportForm.get('type')?.value;
    const transportType = this.transportTypes.find(
      (t) => t.value === selectedType,
    );
    return transportType?.icon || 'directions';
  }

  getDepartureDateTime(): Date | null {
    const date = this.transportForm.get('departureDate')?.value;
    const time = this.transportForm.get('departureTime')?.value;

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

  onSubmit(): void {
    if (this.transportForm.valid && !this.loading()) {
      this.loading.set(true);

      const departureDateTime = this.getDepartureDateTime();

      if (!departureDateTime) {
        this.loading.set(false);
        return;
      }

      const transportData: CreateTransportDto = {
        name: this.transportForm.get('name')?.value.trim(),
        type: this.transportForm.get('type')?.value,
        details: this.transportForm.get('details')?.value.trim(),
        departureTime: departureDateTime.toISOString(),
        mapUrl: this.transportForm.get('mapUrl')?.value?.trim() || undefined,
        eventId: this.data.eventId,
        groupIds: Array.from(this.selectedGroups()),
      };

      // Simular delay de API
      setTimeout(() => {
        this.loading.set(false);
        const result: CreateTransportModalResult = {
          action: this.isEditMode ? 'edit' : 'create',
          data: transportData,
        };
        this.dialogRef.close(result);
      }, 800);
    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.markFormGroupTouched(this.transportForm);
    }
  }

  onCancel(): void {
    const result: CreateTransportModalResult = {
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
