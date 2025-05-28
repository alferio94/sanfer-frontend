import { effect, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
export type ThemeMode = 'light' | 'dark' | 'auto';
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  // Signals para manejar el estado del tema
  private readonly _isDarkMode = signal<boolean>(false);
  private readonly _themeMode = signal<ThemeMode>('light');

  // Signals públicos (readonly)
  readonly isDarkMode = this._isDarkMode.asReadonly();
  readonly themeMode = this._themeMode.asReadonly();

  constructor() {
    this.initializeTheme();

    // Effect para aplicar cambios automáticamente
    effect(() => {
      this.applyTheme(this._isDarkMode());
    });
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(
      environment.theme.storageKey,
    ) as ThemeMode;
    const defaultTheme = environment.theme.defaultTheme as ThemeMode;

    const themeMode = savedTheme || defaultTheme;
    this._themeMode.set(themeMode);

    const shouldBeDark = this.calculateDarkMode(themeMode);
    this._isDarkMode.set(shouldBeDark);
  }

  private calculateDarkMode(mode: ThemeMode): boolean {
    switch (mode) {
      case 'dark':
        return true;
      case 'light':
        return false;
      case 'auto':
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      default:
        return false;
    }
  }

  private applyTheme(isDark: boolean): void {
    const htmlElement = document.documentElement;

    if (isDark) {
      htmlElement.classList.add('dark-theme');
    } else {
      htmlElement.classList.remove('dark-theme');
    }
  }

  // Métodos públicos
  toggleTheme(): void {
    const currentMode = this._themeMode();
    let newMode: ThemeMode;

    switch (currentMode) {
      case 'light':
        newMode = 'dark';
        break;
      case 'dark':
        newMode = 'auto';
        break;
      case 'auto':
        newMode = 'light';
        break;
      default:
        newMode = 'light';
    }

    this.setThemeMode(newMode);
  }

  setThemeMode(mode: ThemeMode): void {
    this._themeMode.set(mode);
    const shouldBeDark = this.calculateDarkMode(mode);
    this._isDarkMode.set(shouldBeDark);

    localStorage.setItem(environment.theme.storageKey, mode);
  }

  setDarkMode(isDark: boolean): void {
    const newMode: ThemeMode = isDark ? 'dark' : 'light';
    this.setThemeMode(newMode);
  }

  // Método para escuchar cambios del sistema (para modo auto)
  listenToSystemChanges(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', (e) => {
      if (this._themeMode() === 'auto') {
        this._isDarkMode.set(e.matches);
      }
    });
  }

  // Getter para compatibilidad
  get currentTheme(): { mode: ThemeMode; isDark: boolean } {
    return {
      mode: this._themeMode(),
      isDark: this._isDarkMode(),
    };
  }
}
