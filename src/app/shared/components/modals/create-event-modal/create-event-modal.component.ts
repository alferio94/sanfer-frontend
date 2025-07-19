// src/app/shared/components/modals/create-event-modal/create-event-modal.component.ts
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

// Rich Text Editor
import { RichTextEditorComponent } from '@shared/components/rich-text-editor/rich-text-editor.component';

// Models
import { AppEvent } from '@core/models';
import { CreateEventDto } from '@core/dtos';

interface CreateEventModalData {
  mode: 'create' | 'edit';
  event?: AppEvent;
}

interface CreateEventModalResult {
  action: 'create' | 'edit' | 'cancel';
  data?: CreateEventDto;
}

@Component({
  selector: 'app-create-event-modal',
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
    RichTextEditorComponent,
  ],
  templateUrl: './create-event-modal.component.html',
  styleUrl: './create-event-modal.component.scss',
})
export class CreateEventModalComponent implements OnInit {
  eventForm: FormGroup;
  loading = signal(false);

  // Rich text editor configurations
  tipsRichTextConfig = {
    placeholder: 'Ej. Bring your laptop, business cards, and be ready to network!',
    maxLength: 1000,
    height: '150px',
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ]
  };

  richTextConfig = {
    placeholder: 'Información adicional sobre el evento (formato enriquecido)...',
    maxLength: 1000,
    height: '200px',
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ]
  };

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<
      CreateEventModalComponent,
      CreateEventModalResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: CreateEventModalData,
  ) {
    this.eventForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.event) {
      this.loadEventData(this.data.event);
    }
  }

  // Getters
  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  // Métodos para obtener las fechas y horas combinadas
  getStartDateTime(): Date | null {
    const date = this.eventForm.get('startDate')?.value;
    const time = this.eventForm.get('startTime')?.value;

    if (date && time) {
      const combined = new Date(date);
      // MatTimepicker devuelve un objeto Date con la hora seleccionada
      if (time instanceof Date) {
        combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
      } else if (typeof time === 'string') {
        // Fallback para strings en formato HH:MM
        const [hours, minutes] = time.split(':').map(Number);
        combined.setHours(hours, minutes, 0, 0);
      }
      return combined;
    }
    return null;
  }

  getEndDateTime(): Date | null {
    const date = this.eventForm.get('endDate')?.value;
    const time = this.eventForm.get('endTime')?.value;

    if (date && time) {
      const combined = new Date(date);
      // MatTimepicker devuelve un objeto Date con la hora seleccionada
      if (time instanceof Date) {
        combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
      } else if (typeof time === 'string') {
        // Fallback para strings en formato HH:MM
        const [hours, minutes] = time.split(':').map(Number);
        combined.setHours(hours, minutes, 0, 0);
      }
      return combined;
    }
    return null;
  }

  private createForm(): FormGroup {
    return this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        startDate: ['', Validators.required],
        startTime: ['', Validators.required],
        endDate: ['', Validators.required],
        endTime: ['', Validators.required],
        // Campos opcionales
        campus: [''],
        campusPhone: [''],
        campusMap: [''],
        tips: [''],
        extra: [''],
      },
      {
        validators: [this.dateTimeRangeValidator()],
      },
    );
  }

  private loadEventData(event: AppEvent): void {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    // Para MatTimepicker, necesitamos crear objetos Date con solo la hora
    const startTime = new Date();
    startTime.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);

    const endTime = new Date();
    endTime.setHours(endDate.getHours(), endDate.getMinutes(), 0, 0);

    this.eventForm.patchValue({
      name: event.name,
      startDate: startDate,
      startTime: startTime,
      endDate: endDate,
      endTime: endTime,
      // Campos opcionales
      campus: event.campus || '',
      campusPhone: event.campusPhone || '',
      campusMap: event.campusMap || '',
      tips: event.tips || '',
      extra: event.extra || '',
    });
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
    if (this.eventForm.valid && !this.loading()) {
      this.loading.set(true);

      const start = this.getStartDateTime();
      const end = this.getEndDateTime();

      if (!start || !end) {
        this.loading.set(false);
        return;
      }

      const eventData: CreateEventDto = {
        name: this.eventForm.get('name')?.value.trim(),
        startDate: start,
        endDate: end,
        // Campos opcionales
        campus: this.eventForm.get('campus')?.value?.trim() || undefined,
        campusPhone: this.eventForm.get('campusPhone')?.value?.trim() || undefined,
        campusMap: this.eventForm.get('campusMap')?.value?.trim() || undefined,
        tips: this.eventForm.get('tips')?.value?.trim() || undefined,
        extra: this.eventForm.get('extra')?.value?.trim() || undefined,
      };

      // Simular delay de API
      setTimeout(() => {
        this.loading.set(false);
        const result: CreateEventModalResult = {
          action: this.isEditMode ? 'edit' : 'create',
          data: eventData,
        };
        this.dialogRef.close(result);
      }, 800);
    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.markFormGroupTouched(this.eventForm);
    }
  }

  onCancel(): void {
    const result: CreateEventModalResult = {
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

  // Helper methods para debugging (remover en producción)
  get debugInfo() {
    return {
      isEditMode: this.isEditMode,
      formValid: this.eventForm.valid,
      formValue: this.eventForm.value,
      startDateTime: this.getStartDateTime(),
      endDateTime: this.getEndDateTime(),
      loading: this.loading(),
      errors: this.eventForm.errors,
    };
  }
}
