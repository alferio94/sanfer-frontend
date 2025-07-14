import { Component, Inject, OnInit } from '@angular/core';
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
import { Hotel } from '@core/models/hotel.interface';
import { CreateHotelDto, UpdateHotelDto } from '@core/dtos';

interface CreateHotelModalData {
  eventId: string;
  mode: 'create' | 'edit';
  hotel?: Hotel;
}

interface CreateHotelModalResult {
  action: 'create' | 'edit' | 'cancel';
  data?: CreateHotelDto | UpdateHotelDto;
}

@Component({
  selector: 'app-create-hotel-modal',
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
  templateUrl: './create-hotel-modal.component.html',
  styleUrl: './create-hotel-modal.component.scss',
})
export class CreateHotelModalComponent implements OnInit {
  hotelForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<
      CreateHotelModalComponent,
      CreateHotelModalResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: CreateHotelModalData,
  ) {
    this.hotelForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.hotel) {
      this.loadHotelData(this.data.hotel);
    }
  }

  // Getters
  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      phone: [
        '',
        [
          Validators.required,
          Validators.minLength(7),
          Validators.pattern(
            /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
          ),
        ],
      ],
      mapUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/\S+/)]],
      photoUrl: ['', [Validators.pattern(/^https?:\/\/\S+/)]],
    });
  }

  private loadHotelData(hotel: Hotel): void {
    this.hotelForm.patchValue({
      name: hotel.name,
      address: hotel.address,
      phone: hotel.phone || '',
      mapUrl: hotel.mapUrl || '',
      photoUrl: hotel.photoUrl || '',
    });
  }

  onSubmit(): void {
    if (this.hotelForm.valid && !this.loading) {
      this.loading = true;

      const hotelData: CreateHotelDto | UpdateHotelDto = {
        name: this.hotelForm.get('name')?.value.trim(),
        address: this.hotelForm.get('address')?.value.trim(),
        eventId: this.data.eventId,
        phone: this.hotelForm.get('phone')?.value.trim(),
        mapUrl: this.hotelForm.get('mapUrl')?.value.trim(),
        photoUrl: this.hotelForm.get('photoUrl')?.value?.trim() || undefined,
      };

      // Simular delay de API
      setTimeout(() => {
        this.loading = false;
        const result: CreateHotelModalResult = {
          action: this.isEditMode ? 'edit' : 'create',
          data: hotelData,
        };
        this.dialogRef.close(result);
      }, 500);
    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.markFormGroupTouched(this.hotelForm);
    }
  }

  onCancel(): void {
    const result: CreateHotelModalResult = {
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
