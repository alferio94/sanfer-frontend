// src/app/shared/components/modals/app-menu-config-modal/app-menu-config-modal.component.ts
import { Component, Inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Material imports
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Models & Services
import {
  AppMenu,
  AppMenuConfig,
  AppMenuSection,
  APP_MENU_SECTIONS,
  DEFAULT_APP_MENU_CONFIG,
} from '@core/models/app-menu.interface';
import { AppMenuService } from '@core/services/app-menu.service';

export interface AppMenuConfigModalData {
  eventId: string;
  eventName?: string;
}

export interface AppMenuConfigModalResult {
  action: 'save' | 'cancel';
  data?: AppMenu;
}

@Component({
  selector: 'app-app-menu-config-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './app-menu-config-modal.component.html',
  styleUrls: ['./app-menu-config-modal.component.scss'],
})
export class AppMenuConfigModalComponent implements OnInit {
  // Signals
  readonly loading = signal<boolean>(true);
  readonly saving = signal<boolean>(false);
  readonly menuConfig = signal<AppMenuConfig>({ ...DEFAULT_APP_MENU_CONFIG });
  readonly originalConfig = signal<AppMenuConfig | null>(null);

  // Menu sections metadata
  readonly menuSections: AppMenuSection[] = APP_MENU_SECTIONS;

  // Computed signals
  readonly hasChanges = computed(() => {
    const original = this.originalConfig();
    if (!original) return false;

    const current = this.menuConfig();
    return this.menuSections.some(
      (section) => original[section.key] !== current[section.key],
    );
  });

  readonly enabledCount = computed(() => {
    const config = this.menuConfig();
    return this.menuSections.filter((section) => config[section.key]).length;
  });

  readonly allEnabled = computed(() => {
    return this.enabledCount() === this.menuSections.length;
  });

  readonly noneEnabled = computed(() => {
    return this.enabledCount() === 0;
  });

  constructor(
    private dialogRef: MatDialogRef<
      AppMenuConfigModalComponent,
      AppMenuConfigModalResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: AppMenuConfigModalData,
    private appMenuService: AppMenuService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadMenuConfig();
  }

  /**
   * Load the current menu configuration from the server
   */
  private loadMenuConfig(): void {
    this.loading.set(true);

    this.appMenuService.getByEventId(this.data.eventId).subscribe({
      next: (appMenu) => {
        const config = this.extractConfigFromAppMenu(appMenu);
        this.menuConfig.set(config);
        this.originalConfig.set({ ...config });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading menu config:', error);
        // Use defaults on error
        this.menuConfig.set({ ...DEFAULT_APP_MENU_CONFIG });
        this.originalConfig.set({ ...DEFAULT_APP_MENU_CONFIG });
        this.loading.set(false);
      },
    });
  }

  /**
   * Toggle a specific section
   */
  onToggleSection(key: keyof AppMenuConfig, enabled: boolean): void {
    this.menuConfig.update((config) => ({
      ...config,
      [key]: enabled,
    }));
  }

  /**
   * Enable all sections dynamically based on APP_MENU_SECTIONS
   */
  enableAll(): void {
    const allEnabled = this.menuSections.reduce((acc, section) => {
      acc[section.key] = true;
      return acc;
    }, {} as AppMenuConfig);
    this.menuConfig.set(allEnabled);
  }

  /**
   * Disable all sections dynamically based on APP_MENU_SECTIONS
   */
  disableAll(): void {
    const allDisabled = this.menuSections.reduce((acc, section) => {
      acc[section.key] = false;
      return acc;
    }, {} as AppMenuConfig);
    this.menuConfig.set(allDisabled);
  }

  /**
   * Reset to original values
   */
  resetToOriginal(): void {
    const original = this.originalConfig();
    if (original) {
      this.menuConfig.set({ ...original });
    }
  }

  /**
   * Save the configuration
   */
  onSave(): void {
    if (this.saving() || !this.hasChanges()) return;

    this.saving.set(true);

    this.appMenuService
      .saveConfig(this.data.eventId, this.menuConfig())
      .subscribe({
        next: (appMenu) => {
          this.saving.set(false);
          this.showMessage('Configuracion del menu guardada exitosamente');
          this.dialogRef.close({
            action: 'save',
            data: appMenu,
          });
        },
        error: (error) => {
          this.saving.set(false);
          console.error('Error saving menu config:', error);
          this.showMessage('Error al guardar la configuracion', 'error');
        },
      });
  }

  /**
   * Cancel and close the modal
   */
  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  /**
   * Show a snackbar message
   */
  private showMessage(
    message: string,
    type: 'success' | 'error' = 'success',
  ): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      panelClass: type === 'error' ? 'error-snackbar' : 'success-snackbar',
    });
  }

  /**
   * Extract AppMenuConfig from AppMenu by removing id and eventId
   * This makes the code DRY - if new sections are added, this automatically handles them
   */
  private extractConfigFromAppMenu(appMenu: AppMenu): AppMenuConfig {
    const { id, eventId, ...config } = appMenu;
    return config;
  }
}
