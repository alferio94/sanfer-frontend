import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { filter, take, switchMap, catchError } from 'rxjs/operators';

import { SecureStorageService } from '../services/secure-storage.service';

// Estado global para el refresh token
let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const storageService = inject(SecureStorageService);

  // Obtener el token de acceso directamente del storage
  const accessToken = storageService.getSecureItem('accessToken');

  console.log('🔍 Interceptor - URL:', request.url);
  console.log(
    '🔍 Interceptor - Access Token:',
    accessToken ? `${accessToken.substring(0, 20)}...` : 'No token',
  );
  console.log('🔍 Interceptor - Should add token:', shouldAddToken(request));

  // Agregar token a requests que lo requieren
  if (accessToken && shouldAddToken(request)) {
    request = addTokenToRequest(request, accessToken);
    console.log('✅ Interceptor - Token added to request');
  } else {
    console.log('❌ Interceptor - Token NOT added to request');
  }

  return next(request).pipe(
    catchError((error) => {
      // Manejar errores 401 (Unauthorized)
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(request, next, storageService);
      }

      return throwError(() => error);
    }),
  );
};

/**
 * Determina si se debe agregar el token al request
 */
function shouldAddToken(request: HttpRequest<any>): boolean {
  // No agregar token a endpoints públicos
  const publicEndpoints = [
    '/usuarios/login',
    '/usuarios/register',
    '/usuarios/refresh',
  ];

  // Verificar si es un endpoint público
  const isPublicEndpoint = publicEndpoints.some((endpoint) =>
    request.url.includes(endpoint),
  );

  // Solo agregar token si NO es un endpoint público
  return !isPublicEndpoint;
}

/**
 * Agrega el token de autorización al request
 */
function addTokenToRequest(
  request: HttpRequest<any>,
  token: string,
): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Maneja errores 401 limpiando tokens y redirigiendo
 */
function handle401Error(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  storageService: SecureStorageService,
): Observable<HttpEvent<any>> {
  // En caso de 401, limpiar tokens y redirigir
  console.warn('🔐 Auth token invalid, clearing storage and redirecting to login');
  
  // Limpiar tokens
  storageService.clearAll();
  
  // Redirigir a login
  window.location.href = '/login';
  
  return throwError(() => new Error('Authentication required'));
}

