import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { filter, take, switchMap, catchError } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Obtener el token de acceso
    const accessToken = this.authService.getAccessToken();

    // Agregar token a requests que lo requieren
    if (accessToken && this.shouldAddToken(request)) {
      request = this.addTokenToRequest(request, accessToken);
    }

    return next.handle(request).pipe(
      catchError(error => {
        // Manejar errores 401 (Unauthorized)
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Determina si se debe agregar el token al request
   */
  private shouldAddToken(request: HttpRequest<any>): boolean {
    // No agregar token a endpoints públicos
    const publicEndpoints = [
      '/usuarios/login',
      '/usuarios/register',
      '/usuarios/refresh'
    ];

    return !publicEndpoints.some(endpoint => request.url.includes(endpoint));
  }

  /**
   * Agrega el token de autorización al request
   */
  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  /**
   * Maneja errores 401 intentando renovar el token
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Si ya estamos renovando el token, esperar
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token: string) => {
          return next.handle(this.addTokenToRequest(request, token));
        })
      );
    }

    // Iniciar proceso de renovación
    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.authService.refreshToken().pipe(
      switchMap((response) => {
        this.isRefreshing = false;
        const newToken = this.authService.getAccessToken();
        this.refreshTokenSubject.next(newToken);

        // Rehacer el request original con el nuevo token
        return next.handle(this.addTokenToRequest(request, newToken!));
      }),
      catchError((error) => {
        this.isRefreshing = false;
        this.refreshTokenSubject.next(null);

        // Si la renovación falla, hacer logout
        this.authService.logout(false);
        
        return throwError(() => error);
      })
    );
  }
}