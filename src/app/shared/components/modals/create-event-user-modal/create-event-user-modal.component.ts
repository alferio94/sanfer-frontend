import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { EventGroup } from '@core/models';
import { EventsService } from '@core/services/events.service';

interface CreateEventUserModalData {
  eventId: string;
}

interface CreateEventUserRequest {
  name: string;
  email: string;
  groups: string[];
}

@Component({
  selector: 'app-create-event-user-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
  ],
  templateUrl: './create-event-user-modal.component.html',
  styleUrl: './create-event-user-modal.component.scss',
})
export class CreateEventUserModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly eventsService = inject(EventsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<CreateEventUserModalComponent>);
  private readonly data = inject<CreateEventUserModalData>(MAT_DIALOG_DATA);

  readonly form: FormGroup;
  readonly loading = signal<boolean>(false);
  readonly availableGroups = signal<EventGroup[]>([]);
  readonly selectedGroups = signal<string[]>([]);

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      groups: [[], []]
    });
  }

  ngOnInit(): void {
    this.loadEventGroups();
  }

  private loadEventGroups(): void {
    this.loading.set(true);
    this.eventsService.getGroupsByEvent(this.data.eventId).subscribe({
      next: (groups) => {
        this.availableGroups.set(groups);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading event groups:', error);
        this.showMessage('Error al cargar los grupos del evento', 'error');
        this.loading.set(false);
      }
    });
  }

  onGroupSelectionChange(selectedGroups: string[]): void {
    this.selectedGroups.set(selectedGroups);
    this.form.patchValue({ groups: selectedGroups });
  }

  removeGroup(groupName: string): void {
    const currentGroups = this.selectedGroups();
    const updatedGroups = currentGroups.filter(group => group !== groupName);
    this.selectedGroups.set(updatedGroups);
    this.form.patchValue({ groups: updatedGroups });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading.set(true);
      
      const formValue = this.form.value;
      const requestData: CreateEventUserRequest = {
        name: formValue.name.trim(),
        email: formValue.email.trim().toLowerCase(),
        groups: this.selectedGroups()
      };

      this.eventsService.createEventUser(this.data.eventId, requestData).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.showMessage('Usuario creado y asignado al evento exitosamente', 'success');
          this.dialogRef.close({ 
            action: 'created',
            user: response.user,
            assignment: response.assignment
          });
        },
        error: (error) => {
          console.error('Error creating event user:', error);
          this.loading.set(false);
          
          let errorMessage = 'Error al crear el usuario';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 400) {
            errorMessage = 'Datos inválidos. Por favor, verifica la información.';
          } else if (error.status === 409) {
            errorMessage = 'El usuario ya existe y está asignado a este evento.';
          }
          
          this.showMessage(errorMessage, 'error');
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancelled' });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  private showMessage(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      panelClass: type === 'error' ? 'error-snackbar' : 'success-snackbar',
    });
  }

  // Getters for form validation
  get nameControl() { return this.form.get('name'); }
  get emailControl() { return this.form.get('email'); }
  get groupsControl() { return this.form.get('groups'); }
}