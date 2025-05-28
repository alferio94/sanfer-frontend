// src/app/shared/components/theme-toggle/theme-toggle.component.ts
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

// Services
import { ThemeService, ThemeMode } from '../../../core/services/theme.service';
import { MatDivider } from '@angular/material/divider';
@Component({
  selector: 'app-theme-toggle',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDivider,
  ],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);

  // Computed para las clases del botón
  buttonClasses = computed(() => {
    return ['theme-toggle-button', 'action-button'];
  });

  constructor() {
    // Inicializar listener para cambios del sistema
    this.themeService.listenToSystemChanges();
  }

  setTheme(mode: ThemeMode): void {
    this.themeService.setThemeMode(mode);
  }

  getThemeIcon(): string {
    const mode = this.themeService.themeMode();
    const isDark = this.themeService.isDarkMode();

    switch (mode) {
      case 'light':
        return 'light_mode';
      case 'dark':
        return 'dark_mode';
      case 'auto':
        return isDark ? 'dark_mode' : 'light_mode';
      default:
        return 'light_mode';
    }
  }

  getTooltipText(): string {
    const mode = this.themeService.themeMode();

    switch (mode) {
      case 'light':
        return 'Tema claro activo';
      case 'dark':
        return 'Tema oscuro activo';
      case 'auto':
        return 'Tema automático activo';
      default:
        return 'Cambiar tema';
    }
  }

  // Debug info
  get debugInfo() {
    return {
      mode: this.themeService.themeMode(),
      isDark: this.themeService.isDarkMode(),
      icon: this.getThemeIcon(),
    };
  }
}
