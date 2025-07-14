// src/app/shared/components/modals/create-speaker-modal/create-speaker-modal.component.ts
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Models
import { Speaker } from '@core/models/speaker.interface';
import { CreateSpeakerDto } from '@core/dtos/index';

interface CreateSpeakerModalData {
  eventId: string;
  mode: 'create' | 'edit';
  speaker?: Speaker;
}

interface CreateSpeakerModalResult {
  action: 'create' | 'edit' | 'cancel';
  data?: CreateSpeakerDto;
}
@Component({
  selector: 'app-create-speaker-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './create-speaker-modal.component.html',
  styleUrls: ['./create-speaker-modal.component.scss'],
})
export class CreateSpeakerModalComponent implements OnInit {
  speakerForm: FormGroup;
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<
      CreateSpeakerModalComponent,
      CreateSpeakerModalResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: CreateSpeakerModalData,
  ) {
    this.speakerForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.speaker) {
      this.loadSpeakerData(this.data.speaker);
    }
  }

  // Getters
  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      presentation: ['', [Validators.required, Validators.minLength(5)]],
      specialty: ['', [Validators.required, Validators.minLength(2)]],
      photoUrl: ['', [Validators.pattern(/^https?:\/\/\S+/)]],
    });
  }

  private loadSpeakerData(speaker: Speaker): void {
    this.speakerForm.patchValue({
      name: speaker.name,
      presentation: speaker.presentation,
      specialty: speaker.specialty,
      photoUrl: speaker.photoUrl || '',
    });
  }

  getPhotoUrl(): string | null {
    const url = this.speakerForm.get('photoUrl')?.value;
    return url && this.speakerForm.get('photoUrl')?.valid ? url : null;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  onSubmit(): void {
    if (this.speakerForm.valid && !this.loading()) {
      this.loading.set(true);

      const speakerData: CreateSpeakerDto = {
        name: this.speakerForm.get('name')?.value.trim(),
        presentation: this.speakerForm.get('presentation')?.value.trim(),
        specialty: this.speakerForm.get('specialty')?.value.trim(),
        photoUrl: this.speakerForm.get('photoUrl')?.value?.trim() || undefined,
        eventId: this.data.eventId,
      };

      // Simular delay de API
      setTimeout(() => {
        this.loading.set(false);
        const result: CreateSpeakerModalResult = {
          action: this.isEditMode ? 'edit' : 'create',
          data: speakerData,
        };
        this.dialogRef.close(result);
      }, 500);
    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.markFormGroupTouched(this.speakerForm);
    }
  }

  onCancel(): void {
    const result: CreateSpeakerModalResult = {
      action: 'cancel',
    };
    this.dialogRef.close(result);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }
}
