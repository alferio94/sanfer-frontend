// src/app/shared/components/image-cropper-modal/image-cropper-demo.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

import { ImageUtilsService } from '../../services/image-utils.service';
import { ImageCropperConfig, IMAGE_CROPPER_PRESETS } from './image-cropper-modal.interfaces';

@Component({
  selector: 'app-image-cropper-demo',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
  ],
  template: `
    <div class="demo-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Image Cropper Demo</mat-card-title>
          <mat-card-subtitle>Prueba el componente de recorte de imágenes</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="demo-controls">
            <div class="preset-selector">
              <label for="preset">Preset:</label>
              <mat-select [(value)]="selectedPreset" id="preset">
                <mat-option value="BANNER">Banner (16:9)</mat-option>
                <mat-option value="PROFILE_SQUARE">Perfil Cuadrado (1:1)</mat-option>
                <mat-option value="PROFILE_RECTANGLE">Perfil Rectangular (4:3)</mat-option>
                <mat-option value="EVENT_COVER">Portada de Evento (3:2)</mat-option>
              </mat-select>
            </div>
            
            <button 
              mat-raised-button 
              color="primary" 
              (click)="selectAndCropImage()"
              [disabled]="processing()"
            >
              <mat-icon>add_photo_alternate</mat-icon>
              Seleccionar y Recortar Imagen
            </button>
          </div>
          
          @if (croppedImage()) {
            <div class="result-preview">
              <h3>Resultado:</h3>
              <img [src]="croppedImage()" alt="Imagen recortada" class="cropped-result" />
              <div class="result-info">
                <p><strong>Tamaño:</strong> {{ imageSize() }}</p>
                <p><strong>Dimensiones:</strong> {{ imageDimensions() }}</p>
              </div>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .demo-controls {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .preset-selector {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      
      label {
        font-weight: 500;
        color: var(--mat-sys-on-surface);
      }
      
      mat-select {
        max-width: 300px;
      }
    }
    
    .result-preview {
      margin-top: 2rem;
      padding: 1rem;
      background: var(--mat-sys-surface-container);
      border-radius: 0.5rem;
      
      h3 {
        margin-top: 0;
        color: var(--mat-sys-on-surface);
      }
      
      .cropped-result {
        max-width: 100%;
        max-height: 300px;
        border-radius: 0.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 1rem;
      }
      
      .result-info {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        
        p {
          margin: 0;
          color: var(--mat-sys-on-surface-variant);
          font-size: 0.875rem;
        }
      }
    }
  `]
})
export class ImageCropperDemoComponent {
  private imageUtilsService = inject(ImageUtilsService);
  private snackBar = inject(MatSnackBar);

  selectedPreset: keyof typeof IMAGE_CROPPER_PRESETS = 'PROFILE_SQUARE';
  
  readonly processing = signal(false);
  readonly croppedImage = signal<string | null>(null);
  readonly imageSize = signal<string>('');
  readonly imageDimensions = signal<string>('');

  async selectAndCropImage(): Promise<void> {
    try {
      this.processing.set(true);
      
      // Select file
      const files = await this.imageUtilsService.selectFiles('image/*', false);
      if (!files || files.length === 0) {
        this.processing.set(false);
        return;
      }

      const file = files[0];
      
      // Validate file
      const validation = this.imageUtilsService.validateImageFile(file);
      if (!validation.valid) {
        this.snackBar.open(validation.error || 'Error de validación', 'Cerrar', {
          duration: 4000,
          panelClass: 'error-snackbar'
        });
        this.processing.set(false);
        return;
      }

      // Get preset config
      const presetConfig = IMAGE_CROPPER_PRESETS[this.selectedPreset];
      
      // Open cropper
      const result = await this.imageUtilsService.openImageCropper(file, presetConfig).toPromise();
      
      if (result) {
        this.croppedImage.set(result.base64);
        this.imageSize.set(this.imageUtilsService.formatFileSize(result.size));
        this.imageDimensions.set(`${result.dimensions.width} x ${result.dimensions.height}`);
        
        this.snackBar.open('Imagen recortada exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
      }
      
    } catch (error) {
      console.error('Error cropping image:', error);
      this.snackBar.open('Error al recortar la imagen', 'Cerrar', {
        duration: 4000,
        panelClass: 'error-snackbar'
      });
    } finally {
      this.processing.set(false);
    }
  }
}