// src/app/shared/services/image-utils.service.ts
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { 
  ImageCropperConfig,
  ImageCropperResult,
  ImageCropperModalData,
  ImageCropperModalResult,
  IMAGE_CROPPER_PRESETS
} from '../components/image-cropper-modal/image-cropper-modal.interfaces';
import { ImageCropperModalComponent } from '../components/image-cropper-modal/image-cropper-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ImageUtilsService {
  
  constructor(private dialog: MatDialog) {}

  /**
   * Opens the image cropper modal
   */
  openImageCropper(
    config: Partial<ImageCropperConfig> = {}
  ): Observable<ImageCropperResult | null> {
    const modalData: ImageCropperModalData = {
      config: {
        ...IMAGE_CROPPER_PRESETS.PROFILE_SQUARE,
        ...config
      }
    };

    const dialogRef = this.dialog.open(ImageCropperModalComponent, {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: modalData,
      disableClose: true,
      panelClass: 'image-cropper-dialog'
    });

    return new Observable<ImageCropperResult | null>(observer => {
      dialogRef.afterClosed().subscribe((result: ImageCropperModalResult) => {
        if (result?.action === 'crop' && result.result) {
          observer.next(result.result);
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });
  }

  /**
   * Validates if a file is a valid image
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    console.log('Validating file:', file.type, file.size);

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Formato de archivo no válido. Solo se permiten JPG, PNG, WebP y GIF.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'El archivo es demasiado grande. Tamaño máximo: 10MB.'
      };
    }

    return { valid: true };
  }

  /**
   * Converts blob to base64
   */
  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Converts base64 to blob
   */
  base64ToBlob(base64: string, type: string = 'image/jpeg'): Blob {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
  }

  /**
   * Generates a unique filename
   */
  generateImageFileName(originalName: string, prefix: string = 'image'): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop() || 'jpg';
    
    return `${prefix}_${timestamp}_${randomString}.${extension}`;
  }

  /**
   * Formats file size to human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Gets image dimensions from file
   */
  getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        const dimensions = {
          width: img.naturalWidth,
          height: img.naturalHeight
        };
        URL.revokeObjectURL(objectUrl);
        resolve(dimensions);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image'));
      };
      
      img.src = objectUrl;
    });
  }

  /**
   * Compresses image maintaining aspect ratio
   */
  compressImage(
    file: File, 
    maxWidth: number = 800, 
    maxHeight: number = 600, 
    quality: number = 0.8
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Creates a file input element for image selection
   */
  createFileInput(
    accept: string = 'image/*',
    multiple: boolean = false
  ): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = multiple;
    input.style.display = 'none';
    
    return input;
  }

  /**
   * Opens file dialog and returns selected files
   */
  selectFiles(
    accept: string = 'image/*',
    multiple: boolean = false
  ): Promise<FileList | null> {
    return new Promise((resolve) => {
      const input = this.createFileInput(accept, multiple);
      
      input.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement;
        resolve(target.files);
        document.body.removeChild(input);
      });
      
      document.body.appendChild(input);
      input.click();
    });
  }

  /**
   * Preset configurations for common use cases
   */
  readonly presets = IMAGE_CROPPER_PRESETS;
}