import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SecureStorageService {
  /**
   * Almacena un valor
   * @param key Clave del item
   * @param value Valor a almacenar
   * @param remember Si true, usa localStorage (persistente), sino sessionStorage
   */
  setSecureItem(key: string, value: string, remember: boolean = false): void {
    try {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(this.getStorageKey(key), value);
    } catch (error) {
      console.error('Error storing item:', error);
    }
  }

  /**
   * Recupera un valor almacenado
   * @param key Clave del item
   * @returns Valor almacenado o null si no existe
   */
  getSecureItem(key: string): string | null {
    try {
      const storageKey = this.getStorageKey(key);

      // Buscar en localStorage primero (para persistencia), luego sessionStorage
      const value = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);

      if (!value) {
        return null;
      }

      // Validar que sea un JWT válido solo si es accessToken
      if (key === 'accessToken' && !this.isValidJWT(value)) {
        console.warn(`Invalid JWT token '${key}', removing corrupted data`);
        this.removeItem(key);
        return null;
      }

      return value;
    } catch (error) {
      console.error('Error retrieving item:', error);
      return null;
    }
  }

  /**
   * Elimina un item de ambos storages
   * @param key Clave del item a eliminar
   */
  removeItem(key: string): void {
    try {
      console.warn(`🗑️ SecureStorage - Removing item: ${key}`);
      console.trace('Stack trace for removeItem call');
      
      const storageKey = this.getStorageKey(key);
      sessionStorage.removeItem(storageKey);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }

  /**
   * Limpia todos los items relacionados con la aplicación
   */
  clearAll(): void {
    try {
      console.warn('🧹 SecureStorage - Clearing ALL items');
      console.trace('Stack trace for clearAll call');
      
      const keysToRemove = [
        'accessToken',
        'refreshToken',
        'rememberMe',
        'returnUrl',
      ];

      keysToRemove.forEach((key) => this.removeItem(key));
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * Verifica si existe un item en el storage
   * @param key Clave del item
   * @returns true si existe, false si no
   */
  hasItem(key: string): boolean {
    return this.getSecureItem(key) !== null;
  }

  /**
   * Genera una clave de storage con prefijo
   * @param key Clave original
   * @returns Clave con prefijo
   */
  private getStorageKey(key: string): string {
    return `sanfer_${key}`;
  }

  /**
   * Valida si un string es un JWT válido
   * @param token Token a validar
   * @returns true si es válido, false si no
   */
  private isValidJWT(token: string): boolean {
    try {
      // Un JWT debe tener 3 partes separadas por puntos
      const parts = token.split('.');

      if (parts.length !== 3) {
        return false;
      }

      // Verificar que cada parte sea base64 válido
      for (const part of parts) {
        if (!part || part.length === 0) {
          return false;
        }

        // Agregar padding si es necesario
        const paddedPart = part + '='.repeat((4 - (part.length % 4)) % 4);

        try {
          atob(paddedPart.replace(/-/g, '+').replace(/_/g, '/'));
        } catch {
          return false;
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
