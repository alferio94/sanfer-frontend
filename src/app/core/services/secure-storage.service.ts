import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  private readonly ENCRYPTION_KEY = 'sanfer_admin_key_v1';

  /**
   * Almacena un valor de forma segura
   * @param key Clave del item
   * @param value Valor a almacenar
   * @param remember Si true, usa localStorage (persistente), sino sessionStorage
   */
  setSecureItem(key: string, value: string, remember: boolean = false): void {
    try {
      const encrypted = this.encrypt(value);
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(this.getStorageKey(key), encrypted);
    } catch (error) {
      console.error('Error storing secure item:', error);
    }
  }

  /**
   * Recupera un valor almacenado de forma segura
   * @param key Clave del item
   * @returns Valor desencriptado o null si no existe
   */
  getSecureItem(key: string): string | null {
    try {
      const storageKey = this.getStorageKey(key);
      
      // Intentar primero sessionStorage, luego localStorage
      let encrypted = sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey);
      
      if (!encrypted) {
        return null;
      }

      // Intentar desencriptar, si falla, limpiar el item corrupto
      try {
        return this.decrypt(encrypted);
      } catch (decryptError) {
        console.warn(`Failed to decrypt stored item '${key}', removing corrupted data:`, decryptError);
        this.removeItem(key);
        return null;
      }
    } catch (error) {
      console.error('Error retrieving secure item:', error);
      return null;
    }
  }

  /**
   * Elimina un item de ambos storages
   * @param key Clave del item a eliminar
   */
  removeItem(key: string): void {
    try {
      const storageKey = this.getStorageKey(key);
      sessionStorage.removeItem(storageKey);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error removing secure item:', error);
    }
  }

  /**
   * Limpia todos los items relacionados con la aplicación
   */
  clearAll(): void {
    try {
      const keysToRemove = [
        'accessToken',
        'refreshToken', 
        'userData',
        'rememberMe',
        'returnUrl'
      ];

      keysToRemove.forEach(key => this.removeItem(key));
    } catch (error) {
      console.error('Error clearing secure storage:', error);
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
   * Encripta un texto usando Base64 + rotación simple
   * @param text Texto a encriptar
   * @returns Texto encriptado
   */
  private encrypt(text: string): string {
    try {
      // Convertir a Base64 y aplicar rotación Caesar simple
      const base64 = btoa(text);
      return this.caesarCipher(base64, 13);
    } catch (error) {
      console.error('Encryption error:', error);
      return text; // Fallback sin encriptar
    }
  }

  /**
   * Desencripta un texto
   * @param encrypted Texto encriptado
   * @returns Texto original
   */
  private decrypt(encrypted: string): string {
    // Revertir rotación Caesar y decodificar Base64
    const base64 = this.caesarCipher(encrypted, -13);
    return atob(base64);
  }

  /**
   * Aplica cifrado Caesar simple
   * @param text Texto a cifrar
   * @param shift Desplazamiento
   * @returns Texto cifrado
   */
  private caesarCipher(text: string, shift: number): string {
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      
      // Solo aplicar a caracteres alfanuméricos y algunos símbolos
      if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122) || 
          (code >= 48 && code <= 57) || [43, 47, 61].includes(code)) {
        return String.fromCharCode(((code - 32 + shift + 95) % 95) + 32);
      }
      
      return char;
    }).join('');
  }
}