// src/app/core/services/app-menu.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, of, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AppMenu,
  AppMenuConfig,
  DEFAULT_APP_MENU_CONFIG,
} from '../models/app-menu.interface';
import { CreateAppMenuDto, UpdateAppMenuDto } from '../dtos/app-menu.dto';

interface AppMenuResponse {
  message: string;
  appMenu: AppMenu;
}

@Injectable({
  providedIn: 'root',
})
export class AppMenuService {
  private http = inject(HttpClient);

  // Signals for local state
  private readonly _appMenu = signal<AppMenu | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Public readonly signals
  readonly appMenu = this._appMenu.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Base URL for app-menu endpoints
  private readonly baseUrl = `${environment.apiUrl}/app-menu`;

  /**
   * Get the app menu configuration for an event.
   * If no configuration exists, the backend will create one with default values.
   * 
   * Note: According to API docs, backend auto-creates a default config if none exists,
   * so this should rarely fail. We still provide fallback for network/auth errors.
   */
  getByEventId(eventId: string): Observable<AppMenu> {
    // Validate eventId
    if (!eventId?.trim()) {
      const error = 'El ID del evento es requerido';
      this._error.set(error);
      return throwError(() => new Error(error));
    }

    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<AppMenuResponse>(`${this.baseUrl}/event/${eventId}`)
      .pipe(
        map((response) => response.appMenu),
        tap((appMenu) => {
          this._appMenu.set(appMenu);
          this._loading.set(false);
        }),
        catchError((error: HttpErrorResponse) => {
          this._loading.set(false);
          const errorMessage = this.handleError(error);
          this._error.set(errorMessage);
          // Return default config as fallback for resilience
          // This ensures the UI can still function even if API fails
          const fallbackMenu = this.createDefaultAppMenu(eventId);
          this._appMenu.set(fallbackMenu);
          return of(fallbackMenu);
        }),
      );
  }

  /**
   * Create a new app menu configuration for an event.
   * Use this when you want to explicitly set the initial configuration.
   */
  create(dto: CreateAppMenuDto): Observable<AppMenu> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.post<AppMenuResponse>(this.baseUrl, dto).pipe(
      map((response) => response.appMenu),
      tap((appMenu) => {
        this._appMenu.set(appMenu);
        this._loading.set(false);
      }),
      catchError((error: HttpErrorResponse) => {
        this._loading.set(false);
        const errorMessage = this.handleError(error);
        this._error.set(errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  /**
   * Update the app menu configuration for an event.
   * Only send the fields you want to update.
   */
  update(eventId: string, dto: UpdateAppMenuDto): Observable<AppMenu> {
    // Validate eventId
    if (!eventId?.trim()) {
      const error = 'El ID del evento es requerido';
      this._error.set(error);
      return throwError(() => new Error(error));
    }

    this._loading.set(true);
    this._error.set(null);

    return this.http
      .put<AppMenuResponse>(`${this.baseUrl}/event/${eventId}`, dto)
      .pipe(
        map((response) => response.appMenu),
        tap((appMenu) => {
          this._appMenu.set(appMenu);
          this._loading.set(false);
        }),
        catchError((error: HttpErrorResponse) => {
          this._loading.set(false);
          const errorMessage = this.handleError(error);
          this._error.set(errorMessage);
          return throwError(() => new Error(errorMessage));
        }),
      );
  }

  /**
   * Upsert operation: Create or update app menu configuration.
   * 
   * Use this method when you don't know if a config exists yet.
   * It will:
   * 1. Try to update if we have current menu in state
   * 2. Otherwise, try to create
   * 3. If create fails with 409 (already exists), retry with update
   * 
   * For explicit create/update operations, use create() or update() directly.
   */
  saveConfig(eventId: string, config: AppMenuConfig): Observable<AppMenu> {
    // Validate eventId
    if (!eventId?.trim()) {
      const error = 'El ID del evento es requerido';
      this._error.set(error);
      return throwError(() => new Error(error));
    }

    const currentMenu = this._appMenu();

    // If we have a current menu, update it
    if (currentMenu && currentMenu.eventId === eventId) {
      return this.update(eventId, config);
    }

    // Otherwise, try to create (backend might return 409 if exists)
    const createDto: CreateAppMenuDto = {
      eventId,
      ...config,
    };

    return this.create(createDto).pipe(
      catchError((error) => {
        // If conflict (already exists), try update instead
        if (error.message?.includes('409') || error.message?.includes('existe')) {
          return this.update(eventId, config);
        }
        return throwError(() => error);
      }),
    );
  }

  /**
   * Clear the current app menu from local state
   */
  clearAppMenu(): void {
    this._appMenu.set(null);
    this._error.set(null);
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * Create a default app menu object (for fallback scenarios)
   */
  private createDefaultAppMenu(eventId: string): AppMenu {
    return {
      id: '',
      eventId,
      ...DEFAULT_APP_MENU_CONFIG,
    };
  }

  /**
   * Handle HTTP errors and return user-friendly messages
   */
  private handleError(error: HttpErrorResponse): string {
    if (error.status === 400) {
      return 'Datos invalidos. Verifica la informacion enviada.';
    }
    if (error.status === 401) {
      return 'No autorizado. Por favor, inicia sesion nuevamente.';
    }
    if (error.status === 404) {
      return 'Configuracion de menu no encontrada.';
    }
    if (error.status === 409) {
      return 'Ya existe una configuracion de menu para este evento.';
    }
    if (error.status === 0) {
      return 'Error de conexion. Verifica tu conexion a internet.';
    }
    return 'Error al procesar la solicitud. Intenta nuevamente.';
  }
}
