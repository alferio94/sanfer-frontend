// src/app/shared/components/modals/create-group-modal/create-group-modal.component.ts
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
import { EventGroup } from '@core/models/group.interface';
import { CreateEventGroupDto } from '@core/dtos';

interface CreateGroupModalData {
  eventId: string;
  mode: 'create' | 'edit';
  group?: EventGroup;
}

interface CreateGroupModalResult {
  action: 'create' | 'edit' | 'cancel';
  data?: CreateEventGroupDto;
}

@Component({
  selector: 'app-create-group-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './create-group-modal.component.html',
  styleUrl: './create-group-modal.component.scss',
})
export class CreateGroupModalComponent implements OnInit {
  groupForm: FormGroup;
  loading = signal(false);

  // Predefined colors for groups
  readonly predefinedColors = [
    '#ef3b42',
    '#3fa4c5',
    '#81c181',
    '#ff9800',
    '#9c27b0',
    '#e91e63',
    '#2196f3',
    '#4caf50',
    '#ff5722',
    '#795548',
    '#607d8b',
    '#f44336',
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<
      CreateGroupModalComponent,
      CreateGroupModalResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: CreateGroupModalData,
  ) {
    this.groupForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.group) {
      this.loadGroupData(this.data.group);
    } else {
      // Set default color for new groups
      this.groupForm.patchValue({
        color: this.predefinedColors[0],
      });
    }
  }

  // Getters
  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      color: ['', Validators.required],
    });
  }

  private loadGroupData(group: EventGroup): void {
    this.groupForm.patchValue({
      name: group.name,
      color: group.color || this.predefinedColors[0],
    });
  }

  onColorSelect(color: string): void {
    this.groupForm.patchValue({ color });
  }

  onSubmit(): void {
    if (this.groupForm.valid && !this.loading()) {
      this.loading.set(true);

      const groupData: CreateEventGroupDto = {
        name: this.groupForm.get('name')?.value.trim(),
        color: this.groupForm.get('color')?.value,
      };

      // Simular delay de API
      setTimeout(() => {
        this.loading.set(false);
        const result: CreateGroupModalResult = {
          action: this.isEditMode ? 'edit' : 'create',
          data: groupData,
        };
        this.dialogRef.close(result);
      }, 500);
    } else {
      // Mark all fields as touched to show errors
      this.markFormGroupTouched(this.groupForm);
    }
  }

  onCancel(): void {
    const result: CreateGroupModalResult = {
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

  get selectedColor(): string {
    return this.groupForm.get('color')?.value || this.predefinedColors[0];
  }
}
