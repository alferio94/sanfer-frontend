// src/app/shared/components/modals/bulk-users-modal/bulk-users-modal.component.ts
import { Component, Inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

// XLSX Library
import * as XLSX from 'xlsx';

// Services
import { EventsService } from '@core/services/events.service';
import { firstValueFrom } from 'rxjs';

interface BulkUsersModalData {
  eventId: string;
}

interface BulkUsersModalResult {
  action: 'upload' | 'cancel';
  usersCount?: number;
}

interface ParsedUser {
  name: string;
  email: string;
  groups: string[];
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: any;
}

@Component({
  selector: 'app-bulk-users-modal',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTableModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './bulk-users-modal.component.html',
  styleUrl: './bulk-users-modal.component.scss',
})
export class BulkUsersModalComponent implements OnInit {
  // Signals
  readonly dragOver = signal(false);
  readonly loading = signal(false);
  readonly uploading = signal(false);
  readonly uploadProgress = signal(0);

  // File processing
  readonly selectedFile = signal<File | null>(null);
  readonly parsedUsers = signal<ParsedUser[]>([]);
  readonly validationErrors = signal<ValidationError[]>([]);
  readonly validUsers = signal<ParsedUser[]>([]);

  // Table columns for preview
  readonly displayedColumns = ['name', 'email', 'groups'];

  constructor(
    private eventsService: EventsService,
    private dialogRef: MatDialogRef<
      BulkUsersModalComponent,
      BulkUsersModalResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: BulkUsersModalData,
  ) {}

  ngOnInit(): void {
    // Initialize component
  }

  // Drag and Drop handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  // File input handler
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      alert('Por favor selecciona un archivo Excel (.xlsx, .xls)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 5MB permitido.');
      return;
    }

    this.selectedFile.set(file);
    this.processFile(file);
  }

  private processFile(file: File): void {
    this.loading.set(true);
    this.parsedUsers.set([]);
    this.validationErrors.set([]);
    this.validUsers.set([]);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let workbook: XLSX.WorkBook;

        // Parse Excel
        workbook = XLSX.read(data, { type: 'array' });

        // Get first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          blankrows: false,
        });

        this.parseUsersData(jsonData);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert(
          'Error al procesar el archivo. Verifica que sea un Excel o CSV válido.',
        );
      } finally {
        this.loading.set(false);
      }
    };

    reader.onerror = () => {
      this.loading.set(false);
      alert('Error al leer el archivo.');
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }

  private parseUsersData(data: any[][]): void {
    if (data.length < 2) {
      alert(
        'El archivo debe tener al menos una fila de headers y una fila de datos.',
      );
      return;
    }

    const headers = data[0].map((h: string) =>
      h?.toString().toLowerCase().trim(),
    );
    const rows = data.slice(1);

    // Find column indices
    const nameIndex = this.findColumnIndex(headers, [
      'name',
      'nombre',
      'usuario',
    ]);
    const emailIndex = this.findColumnIndex(headers, [
      'email',
      'correo',
      'mail',
    ]);
    const groupsIndex = this.findColumnIndex(headers, [
      'groups',
      'grupos',
      'group',
    ]);

    if (nameIndex === -1 || emailIndex === -1) {
      alert(
        'El archivo debe contener columnas "name" y "email". La columna "groups" es opcional.',
      );
      return;
    }

    const parsedUsers: ParsedUser[] = [];
    const errors: ValidationError[] = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because we start from row 2 (after headers)

      const name = row[nameIndex]?.toString().trim() || '';
      const email = row[emailIndex]?.toString().trim() || '';
      const groupsStr = row[groupsIndex]?.toString().trim() || '';

      // Validate name
      if (!name) {
        errors.push({
          row: rowNumber,
          field: 'name',
          message: 'El nombre es obligatorio',
          value: name,
        });
      }

      // Validate email
      if (!email) {
        errors.push({
          row: rowNumber,
          field: 'email',
          message: 'El email es obligatorio',
          value: email,
        });
      } else if (!this.isValidEmail(email)) {
        errors.push({
          row: rowNumber,
          field: 'email',
          message: 'Formato de email inválido',
          value: email,
        });
      }

      // Parse groups
      const groups: string[] = [];
      if (groupsStr) {
        groups.push(
          ...groupsStr
            .split(',')
            .map((g: string) => g.trim())
            .filter((g: string) => g),
        );
      }

      // Only add user if no errors for this row
      const rowErrors = errors.filter((e) => e.row === rowNumber);
      if (rowErrors.length === 0 && name && email) {
        parsedUsers.push({ name, email, groups });
      }
    });

    this.parsedUsers.set(parsedUsers);
    this.validationErrors.set(errors);
    this.validUsers.set(
      parsedUsers.filter((user) =>
        errors.every(
          (error) => error.value !== user.name && error.value !== user.email,
        ),
      ),
    );
  }

  private findColumnIndex(headers: string[], possibleNames: string[]): number {
    for (const name of possibleNames) {
      const index = headers.findIndex((h) => h.includes(name));
      if (index !== -1) return index;
    }
    return -1;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // File removal
  removeFile(): void {
    this.selectedFile.set(null);
    this.parsedUsers.set([]);
    this.validationErrors.set([]);
    this.validUsers.set([]);
  }

  // Upload users
  uploadUsers(): void {
    const users = this.validUsers();
    if (users.length === 0) {
      alert('No hay usuarios válidos para cargar.');
      return;
    }

    this.uploading.set(true);
    this.uploadProgress.set(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      const current = this.uploadProgress();
      if (current < 90) {
        this.uploadProgress.set(current + 10);
      }
    }, 200);
    this.eventsService.assignUsersToEvent(this.data.eventId, users).subscribe({
      next: (result) => {
        clearInterval(progressInterval);
        this.uploadProgress.set(100);
        setTimeout(() => {
          this.dialogRef.close({
            action: 'upload',
            usersCount: users.length,
          });
        }, 500);
      },
      error: (error) => {
        console.error('Error uploading users:', error);
        this.uploading.set(false);
        this.uploadProgress.set(100);
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  // Getters for template
  get hasValidUsers(): boolean {
    return this.validUsers().length > 0;
  }

  get hasErrors(): boolean {
    return this.validationErrors().length > 0;
  }

  get canUpload(): boolean {
    return this.hasValidUsers && !this.loading() && !this.uploading();
  }
}
