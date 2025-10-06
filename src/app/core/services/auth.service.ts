import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { SecureStorageService } from './secure-storage.service';
import {
  Usuario,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
} from '../models/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl || 'http://localhost:3000/api';
  private storage = inject(SecureStorageService);
  private router = inject(Router);
  private http = inject(HttpClient);

  // Signals para estado reactivo
  readonly isAuthenticated = signal(false);
  readonly currentUser = signal<Usuario | null>(null);
  readonly loading = signal(false);

  // Subject para el estado de autenticación (para guards y otros servicios)
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  public authStatus$ = this.authStatusSubject.asObservable();

  constructor() {
    this.initializeAuth();
  }

  /**
   * Inicializa el estado de autenticación al cargar la aplicación
   */
  private initializeAuth(): void {
    try {
      // Limpiar datos corruptos antes de intentar leer
      this.validateAndCleanStorage();

      const token = this.storage.getSecureItem('accessToken');

      if (token) {
        // Solo tenemos token, necesitamos obtener los datos del usuario
        this.fetchUserData();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.clearSession();
    }
  }

  /**
   * Valida y limpia datos corruptos del storage
   */
  private validateAndCleanStorage(): void {
    const keys = ['accessToken', 'refreshToken', 'rememberMe', 'returnUrl'];

    keys.forEach((key) => {
      try {
        this.storage.getSecureItem(key);
      } catch (error) {
        console.warn(`Removing corrupted data for key: ${key}`);
        this.storage.removeItem(key);
      }
    });
  }

  /**
   * Establece el estado de autenticado
   */
  private setAuthenticatedState(user: Usuario): void {
    this.isAuthenticated.set(true);
    this.currentUser.set(user);
    this.authStatusSubject.next(true);
  }

  /**
   * Inicia sesión con email y contraseña
   */
  login(
    email: string,
    password: string,
    rememberMe: boolean = false,
  ): Observable<LoginResponse> {
    this.loading.set(true);

    const loginData: LoginRequest = { email, password };

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/usuarios/login`, loginData)
      .pipe(
        tap((response: LoginResponse) => {
          this.handleLoginSuccess(response, rememberMe);
        }),
        catchError((error) => {
          this.loading.set(false);
          return this.handleAuthError(error, 'Error al iniciar sesión');
        }),
        finalize(() => this.loading.set(false)),
      );
  }

  /**
   * Registra un nuevo usuario administrador
   */
  register(userData: RegisterRequest): Observable<RegisterResponse> {
    this.loading.set(true);

    return this.http
      .post<RegisterResponse>(`${this.apiUrl}/usuarios/register`, userData)
      .pipe(
        catchError((error) => {
          return this.handleAuthError(error, 'Error al registrar usuario');
        }),
        finalize(() => this.loading.set(false)),
      );
  }

  /**
   * Maneja el éxito del login
   */
  private handleLoginSuccess(
    response: LoginResponse,
    rememberMe: boolean,
  ): void {
    const { accessToken, refreshToken, usuario } = response;

    // Solo almacenar tokens, no los datos del usuario
    this.storage.setSecureItem('accessToken', accessToken, rememberMe);
    this.storage.setSecureItem('refreshToken', refreshToken, rememberMe);
    this.storage.setSecureItem('rememberMe', rememberMe.toString(), rememberMe);

    // Datos del usuario solo en signals (estado reactivo)
    this.setAuthenticatedState(usuario);

    // Redirigir a la URL previa o al dashboard
    const returnUrl = this.storage.getSecureItem('returnUrl') || '/dashboard';
    this.storage.removeItem('returnUrl');
    this.router.navigate([returnUrl]);
  }

  /**
   * Refresca el token de acceso
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.storage.getSecureItem('refreshToken');

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const refreshData: RefreshTokenRequest = { refreshToken };

    return this.http
      .post<RefreshTokenResponse>(
        `${this.apiUrl}/usuarios/refresh`,
        refreshData,
      )
      .pipe(
        tap((response: RefreshTokenResponse) => {
          const rememberMe =
            this.storage.getSecureItem('rememberMe') === 'true';
          this.handleTokenRefresh(response, rememberMe);
        }),
        catchError((error) => {
          console.error('Token refresh failed:', error);
          this.logout();
          return throwError(() => error);
        }),
      );
  }

  /**
   * Maneja la renovación exitosa del token
   */
  private handleTokenRefresh(
    response: RefreshTokenResponse,
    rememberMe: boolean,
  ): void {
    const { accessToken, refreshToken } = response;
    this.storage.setSecureItem('accessToken', accessToken, rememberMe);
    this.storage.setSecureItem('refreshToken', refreshToken, rememberMe);
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(showMessage: boolean = true): void {
    const refreshToken = this.storage.getSecureItem('refreshToken');

    // Notificar al backend sobre el logout (fire and forget)
    if (refreshToken) {
      const logoutData: LogoutRequest = { refreshToken };
      this.http.post(`${this.apiUrl}/usuarios/logout`, logoutData).subscribe({
        error: (error) => console.error('Logout API error:', error),
      });
    }

    this.clearSession();
    this.router.navigate(['/login']);
  }

  /**
   * Limpia la sesión local
   */
  private clearSession(): void {
    this.storage.clearAll();
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.authStatusSubject.next(false);
  }

  /**
   * Obtiene el token de acceso actual
   */
  getAccessToken(): string | null {
    return this.storage.getSecureItem('accessToken');
  }

  /**
   * Obtiene los datos del usuario actual desde el servidor
   */
  private fetchUserData(): void {
    const token = this.storage.getSecureItem('accessToken');

    if (!token) {
      console.warn('No access token found, clearing session');
      this.clearSession();
      return;
    }

    this.loading.set(true);

    this.http
      .get<Usuario>(`${this.apiUrl}/usuarios/me`)
      .pipe(
        tap((user: Usuario) => {
          this.setAuthenticatedState(user);
        }),
        catchError((error) => {
          this.clearSession();
          return throwError(() => error);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }

  /**
   * Guarda la URL para redirección después del login
   */
  saveReturnUrl(url: string): void {
    this.storage.setSecureItem('returnUrl', url);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): Usuario | null {
    return this.currentUser();
  }

  /**
   * Maneja errores de autenticación
   */
  private handleAuthError(
    error: HttpErrorResponse,
    defaultMessage: string,
  ): Observable<never> {
    let errorMessage = defaultMessage;

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Credenciales inválidas';
    } else if (error.status === 403) {
      errorMessage = 'No tienes permisos para realizar esta acción';
    } else if (error.status === 0) {
      errorMessage = 'No se pudo conectar con el servidor';
    }

    console.error('Auth service error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
