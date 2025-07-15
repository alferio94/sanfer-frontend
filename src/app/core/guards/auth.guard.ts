import { Injectable, inject } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  CanActivateChild 
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(state.url);
  }

  private checkAuth(url: string): Observable<boolean> | boolean {
    // Verificar si está autenticado localmente
    if (this.authService.isUserAuthenticated()) {
      return true;
    }

    // Verificar si hay tokens válidos almacenados
    const accessToken = this.authService.getAccessToken();
    
    if (accessToken) {
      // Intentar renovar el token para verificar validez
      return this.authService.refreshToken().pipe(
        map(() => {
          return true;
        }),
        catchError(() => {
          // Si falla la renovación, redirigir al login
          this.redirectToLogin(url);
          return of(false);
        })
      );
    }

    // No hay tokens, redirigir al login
    this.redirectToLogin(url);
    return false;
  }

  private redirectToLogin(url: string): void {
    // Guardar la URL para redirección después del login
    if (url !== '/login') {
      this.authService.saveReturnUrl(url);
    }
    
    this.router.navigate(['/login']);
  }
}