// src/app/shared/components/image-cropper-modal/image-cropper-modal.component.ts
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  ImageCropperComponent,
  ImageCroppedEvent,
  LoadedImage,
} from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import {
  ImageCropperConfig,
  ImageCropperResult,
  ImageCropperModalData,
  ImageCropperModalResult,
} from './image-cropper-modal.interfaces';

@Component({
  selector: 'app-image-cropper-modal',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ImageCropperComponent,
  ],
  templateUrl: './image-cropper-modal.component.html',
  styleUrl: './image-cropper-modal.component.scss',
})
export class ImageCropperModalComponent implements OnInit {
  @ViewChild(ImageCropperComponent) imageCropper!: ImageCropperComponent;
  @ViewChild('upload') uploadInput!: ElementRef<HTMLInputElement>;

  readonly loading = signal(false);
  readonly processing = signal(false);
  readonly imageLoaded = signal(false);
  readonly error = signal<string | null>(null);

  // Cropper state - simplified like your working code
  imageChangedEvent: any = null;
  croppedImage: any = '';
  isSet: boolean = false;

  // Drag & drop state
  isDragOver: boolean = false;
  selectedFile: File | null = null;

  constructor(
    private dialogRef: MatDialogRef<
      ImageCropperModalComponent,
      ImageCropperModalResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: ImageCropperModalData,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    // No setup needed - waiting for user to drop/select file
  }

  get config(): ImageCropperConfig {
    const defaults = {
      aspectRatio: 1,
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.9,
      format: 'png' as const,
      maintainAspectRatio: true,
      canvasWidth: 800,
      canvasHeight: 600,
      showAspectRatioList: false,
      allowRotation: false,
      allowFlip: false,
      allowZoom: true,
      title: 'Recortar Imagen',
      subtitle: 'Ajusta la imagen como desees',
    };
    return { ...defaults, ...this.data.config };
  }

  // Drag & Drop handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    console.log('Event dropped:', event);
    console.log('Files dropped:', files);
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  // File input handler
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  private handleFile(file: File): void {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      this.error.set(
        'Formato de archivo no válido. Solo se permiten JPG, PNG, WebP y GIF',
      );
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      this.error.set('El archivo es demasiado grande. Tamaño máximo: 10MB');
      return;
    }

    this.selectedFile = file;
    this.loading.set(true);

    // Create file event like your working code
    this.createFileEvent(file);
  }

  private createFileEvent(file: File): void {
    // Create a fake file input event like your working implementation
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => (index === 0 ? file : null),
    };

    this.imageChangedEvent = {
      target: { files: fileList },
    };

    this.isSet = true;
    this.loading.set(false);
  }

  onImageLoaded(image: LoadedImage): void {
    this.imageLoaded.set(true);
    this.loading.set(false);
  }

  onImageLoadFailed(): void {
    console.error('Image load failed');
    this.error.set('Error al cargar la imagen');
    this.loading.set(false);
  }

  onImageCropped(event: ImageCroppedEvent): void {
    // Simple assignment like your working code
    this.croppedImage = event.base64;
  }

  onCropperReady(): void {
    this.imageLoaded.set(true);
  }

  // No control methods needed - just crop

  async onCrop(): Promise<void> {
    if (!this.croppedImage) {
      this.error.set('No hay imagen recortada disponible');
      return;
    }

    this.processing.set(true);

    try {
      // Convert base64 to blob like your working code
      const blob = await fetch(this.croppedImage).then((res) => res.blob());

      const result: ImageCropperResult = {
        blob: blob,
        base64: this.croppedImage,
        originalFile: this.selectedFile!,
        dimensions: {
          width: this.config.maxWidth || 800,
          height: this.config.maxHeight || 600,
        },
        size: blob.size,
      };

      this.processing.set(false);

      const modalResult: ImageCropperModalResult = {
        action: 'crop',
        result,
      };

      this.dialogRef.close(modalResult);
    } catch (error) {
      console.error('Error processing image:', error);
      this.error.set('Error al procesar la imagen');
      this.processing.set(false);
    }
  }

  // Removed processImage method - using direct blob conversion like your working code

  onCancel(): void {
    const result: ImageCropperModalResult = {
      action: 'cancel',
    };
    this.dialogRef.close(result);
  }

  // Helper methods
  getFileSizeText(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // File input trigger
  triggerFileInput(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event: any) => {
      console.log('File input triggered:', event);
      const file = event.target.files[0];
      if (file) {
        this.handleFile(file);
      }
    };
    fileInput.click();
  }

  getAspectRatioText(): string {
    const ratio = this.config.aspectRatio;
    if (ratio === 1) return '1:1 (Cuadrado)';
    if (ratio === 16 / 9) return '16:9 (Banner)';
    if (ratio === 4 / 3) return '4:3 (Clásico)';
    if (ratio === 3 / 2) return '3:2 (Foto)';
    return `${ratio.toFixed(2)}:1`;
  }

  // Helper methods
  openFileInput() {
    this.uploadInput.nativeElement.click(); // Simula el clic en el input de archivo
  }
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    this.selectedFile = this.imageChangedEvent.target.files[0];
    this.isSet = true;
  }
}
