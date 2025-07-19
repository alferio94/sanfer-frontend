// src/app/shared/components/image-cropper-modal/image-cropper-modal.interfaces.ts

export interface ImageCropperConfig {
  /** Aspect ratio for cropping (width:height) */
  aspectRatio: number;
  
  /** Maximum output width in pixels */
  maxWidth?: number;
  
  /** Maximum output height in pixels */
  maxHeight?: number;
  
  /** Output image quality (0-1) */
  quality?: number;
  
  /** Output image format */
  format?: 'png' | 'jpeg' | 'webp';
  
  /** Whether to maintain aspect ratio */
  maintainAspectRatio?: boolean;
  
  /** Whether to allow resize */
  resizeToWidth?: number;
  
  /** Whether to allow resize */
  resizeToHeight?: number;
  
  /** Cropper canvas width */
  canvasWidth?: number;
  
  /** Cropper canvas height */
  canvasHeight?: number;
  
  /** Whether to show aspect ratio list */
  showAspectRatioList?: boolean;
  
  /** Whether to allow rotation */
  allowRotation?: boolean;
  
  /** Whether to allow flip */
  allowFlip?: boolean;
  
  /** Whether to allow zoom */
  allowZoom?: boolean;
  
  /** Title for the modal */
  title?: string;
  
  /** Subtitle for the modal */
  subtitle?: string;
}

export interface ImageCropperResult {
  /** Cropped image as blob */
  blob: Blob;
  
  /** Cropped image as base64 string */
  base64: string;
  
  /** Original file information */
  originalFile: File;
  
  /** Cropped image dimensions */
  dimensions: {
    width: number;
    height: number;
  };
  
  /** File size in bytes */
  size: number;
}

export interface ImageCropperModalData {
  /** Cropper configuration */
  config: ImageCropperConfig;
}

export interface ImageCropperModalResult {
  /** Action taken */
  action: 'crop' | 'cancel';
  
  /** Cropped image result (only if action is 'crop') */
  result?: ImageCropperResult;
}

// Preset configurations
export const IMAGE_CROPPER_PRESETS = {
  BANNER: {
    aspectRatio: 16 / 9,
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.9,
    format: 'jpeg' as const,
    title: 'Recortar Banner',
    subtitle: 'Ajusta la imagen para usar como banner (16:9)',
  },
  PROFILE_SQUARE: {
    aspectRatio: 1,
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.9,
    format: 'jpeg' as const,
    title: 'Recortar Foto de Perfil',
    subtitle: 'Ajusta la imagen para usar como foto de perfil (1:1)',
  },
  PROFILE_RECTANGLE: {
    aspectRatio: 4 / 3,
    maxWidth: 400,
    maxHeight: 300,
    quality: 0.9,
    format: 'jpeg' as const,
    title: 'Recortar Imagen',
    subtitle: 'Ajusta la imagen (4:3)',
  },
  EVENT_COVER: {
    aspectRatio: 3 / 2,
    maxWidth: 1200,
    maxHeight: 800,
    quality: 0.9,
    format: 'jpeg' as const,
    title: 'Recortar Portada de Evento',
    subtitle: 'Ajusta la imagen para usar como portada (3:2)',
  },
} as const;