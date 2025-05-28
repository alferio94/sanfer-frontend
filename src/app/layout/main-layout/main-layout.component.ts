// src/app/layout/main-layout/main-layout.component.ts
import {
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

// Material imports
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

// Components
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { Subject, debounceTime, takeUntil } from 'rxjs';
@Component({
  selector: 'app-main-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    HeaderComponent,
    SidebarComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') drawer!: MatSidenav;

  private breakpointObserver = inject(BreakpointObserver);
  private destroy$ = new Subject<void>();

  // Signals para estado reactivo
  readonly sidenavOpen = signal(true);
  readonly isHandset = signal(false);

  ngOnInit() {
    // Observar cambios en el tamaño de pantalla
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet])
      .pipe(debounceTime(50), takeUntil(this.destroy$))
      .subscribe((result) => {
        requestAnimationFrame(() => {
          const wasHandset = this.isHandset();
          this.isHandset.set(result.matches);

          // Solo cambiar el estado del sidebar si cambió el tipo de dispositivo
          if (wasHandset !== result.matches) {
            if (result.matches) {
              // Cambió a mobile: cerrar sidebar
              this.sidenavOpen.set(false);
            } else {
              // Cambió a desktop: abrir sidebar
              this.sidenavOpen.set(true);
            }
          }
        });
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Método para toggle del menú hamburguesa (mobile) o sidebar (desktop)
  onMenuToggle(): void {
    if (this.isHandset()) {
      // En mobile: usar el drawer de Material directamente
      this.drawer.toggle();
    } else {
      // En desktop: toggle manual del sidebar
      this.toggleSidebar();
    }
  }

  // Método para toggle manual del sidebar (desktop)
  toggleSidebar(): void {
    const newState = !this.sidenavOpen();
    this.sidenavOpen.set(newState);
  }

  // Método para cerrar sidebar al navegar
  onSidebarNavigation(): void {
    if (this.isHandset()) {
      // Solo cerrar en mobile al navegar
      this.drawer.close();
    }
    // En desktop no hacer nada al navegar
  }

  // Handler para sincronizar el estado del drawer con nuestro signal
  onSidenavOpenedChange(opened: boolean): void {
    if (this.isHandset()) {
      // En mobile, no sincronizar - dejar que Material maneje esto
      return;
    }
    // En desktop, mantener sincronizado
    this.sidenavOpen.set(opened);
  }

  // Getter para el estado efectivo del drawer
  get effectiveSidenavOpen(): boolean {
    if (this.isHandset()) {
      // En mobile, el estado lo maneja Material internamente
      return false; // Por defecto cerrado en mobile
    }
    // En desktop, usamos nuestro signal
    return this.sidenavOpen();
  }

  // Debug info
  get debugInfo() {
    return {
      isHandset: this.isHandset(),
      sidenavOpen: this.sidenavOpen(),
      effectiveOpen: this.effectiveSidenavOpen,
      breakpoint: this.isHandset() ? 'Mobile' : 'Desktop',
    };
  }
}
