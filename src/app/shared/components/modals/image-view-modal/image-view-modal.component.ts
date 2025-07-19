import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ImageViewModalData {
  imageUrl: string;
  title: string;
  altText: string;
}

@Component({
  selector: 'app-image-view-modal',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="image-view-modal">
      <!-- Header -->
      <div class="modal-header" mat-dialog-title>
        <div class="header-content">
          <mat-icon class="header-icon">image</mat-icon>
          <h2>{{ data.title }}</h2>
        </div>
        <button
          mat-icon-button
          class="close-button"
          (click)="onClose()"
          matTooltip="Cerrar"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Image Content -->
      <div class="modal-body" mat-dialog-content>
        <div class="image-container">
          <img
            [src]="data.imageUrl"
            [alt]="data.altText"
            class="hotel-image"
            (error)="onImageError($event)"
            (load)="onImageLoad()"
          />
          <div *ngIf="imageError" class="image-error">
            <mat-icon>broken_image</mat-icon>
            <p>Error al cargar la imagen</p>
          </div>
          <div *ngIf="loading" class="image-loading">
            <mat-icon class="loading-icon">hourglass_empty</mat-icon>
            <p>Cargando imagen...</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer" mat-dialog-actions>
        <button
          mat-raised-button
          color="primary"
          (click)="onClose()"
          class="close-btn"
        >
          <mat-icon>close</mat-icon>
          Cerrar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .image-view-modal {
      width: 100%;
      max-width: 800px;
      display: flex;
      flex-direction: column;
      background: var(--mat-sys-surface);
      border-radius: var(--sanfer-border-radius);
      overflow: hidden;
      box-shadow: var(--sanfer-shadow-lg);
    }

    .modal-header {
      background: var(--sanfer-gradient-hero);
      color: white;
      padding: 1.5rem 2rem 1rem 2rem;
      position: relative;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      opacity: 0.9;
      color: white;
    }

    .header-content h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 400;
      color: white;
    }

    .close-button {
      color: white !important;
      opacity: 0.8;
      transition: all 0.2s ease;
    }

    .close-button:hover {
      opacity: 1;
      background-color: rgba(255, 255, 255, 0.1) !important;
    }

    .modal-body {
      flex: 1;
      padding: 2rem;
      max-height: 70vh;
      overflow: hidden;
    }

    .image-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      min-height: 400px;
      position: relative;
    }

    .hotel-image {
      max-width: 100%;
      max-height: 60vh;
      object-fit: contain;
      border-radius: var(--sanfer-border-radius-sm);
      box-shadow: var(--sanfer-shadow-lg);
      transition: transform 0.2s ease;
    }

    .image-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .image-error mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: var(--mat-sys-error);
    }

    .image-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .loading-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      animation: spin 2s linear infinite;
      color: var(--sanfer-primary);
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .modal-footer {
      background: var(--mat-sys-surface-variant);
      border-top: 1px solid var(--mat-sys-outline-variant);
      padding: 1.5rem 2rem;
    }

    .close-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 120px;
      font-weight: 500;
      border-radius: 24px;
    }

    .close-btn .mat-icon {
      margin-right: 0.5rem;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .image-view-modal {
        max-width: 100%;
        margin: 0;
        height: 100vh;
        border-radius: 0;
      }

      .modal-header {
        padding: 1rem 1.5rem 0.75rem 1.5rem;
      }

      .header-content h2 {
        font-size: 1.25rem;
      }

      .header-icon {
        font-size: 1.5rem;
        width: 1.5rem;
        height: 1.5rem;
      }

      .modal-body {
        padding: 1.5rem;
      }

      .modal-footer {
        padding: 1rem 1.5rem;
      }

      .close-btn {
        width: 100%;
      }
    }
  `]
})
export class ImageViewModalComponent {
  loading = true;
  imageError = false;

  constructor(
    private dialogRef: MatDialogRef<ImageViewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageViewModalData
  ) {}

  onImageLoad(): void {
    this.loading = false;
    this.imageError = false;
  }

  onImageError(event: Event): void {
    this.loading = false;
    this.imageError = true;
    console.error('Error loading image:', event);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}