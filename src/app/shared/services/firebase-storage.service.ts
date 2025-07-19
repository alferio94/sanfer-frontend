import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable, from } from 'rxjs';

export interface UploadResult {
  downloadURL: string;
  fullPath: string;
  fileName: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService {
  private storage = inject(Storage);
  private injector = inject(Injector);

  /**
   * Sube un archivo a Firebase Storage
   * @param file - Archivo a subir (File o Blob)
   * @param path - Ruta donde guardar el archivo (ej: 'banners', 'hotels', 'speakers')
   * @param fileName - Nombre del archivo (normalmente el ID del recurso)
   * @param extension - Extensión del archivo (por defecto 'jpg' para blobs de imagen)
   * @returns Observable con la URL de descarga y metadata
   */
  uploadFile(
    file: File | Blob, 
    path: string, 
    fileName: string, 
    extension: string = 'jpg'
  ): Observable<UploadResult> {
    return runInInjectionContext(this.injector, () => {
      // Crear nombre completo del archivo
      const fullFileName = `${fileName}.${extension}`;
      
      // Crear la referencia completa: path/fileName.extension
      const fullPath = `${path}/${fullFileName}`;
      const storageRef = ref(this.storage, fullPath);

      // Subir archivo y obtener URL
      return from(
        uploadBytes(storageRef, file).then(async (snapshot) => {
          const downloadURL = await getDownloadURL(snapshot.ref);
          return {
            downloadURL,
            fullPath: snapshot.ref.fullPath,
            fileName: fullFileName
          };
        })
      );
    });
  }

  /**
   * Elimina un archivo de Firebase Storage
   * @param fullPath - Ruta completa del archivo a eliminar (ej: 'banners/event-123.jpg')
   * @returns Observable del resultado de la eliminación
   */
  deleteFile(fullPath: string): Observable<void> {
    return runInInjectionContext(this.injector, () => {
      const storageRef = ref(this.storage, fullPath);
      return from(deleteObject(storageRef));
    });
  }

  /**
   * Obtiene la URL de descarga de un archivo existente
   * @param fullPath - Ruta completa del archivo (ej: 'banners/event-123.jpg')
   * @returns Observable con la URL de descarga
   */
  getDownloadUrl(fullPath: string): Observable<string> {
    return runInInjectionContext(this.injector, () => {
      const storageRef = ref(this.storage, fullPath);
      return from(getDownloadURL(storageRef));
    });
  }
}