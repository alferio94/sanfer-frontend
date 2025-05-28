import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

// Components
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

// Services
import { ThemeService } from '../../../core/services/theme.service';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    MatDivider,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    ThemeToggleComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Input() isHandset = false;
  @Input() useGradient = false;
  @Output() menuToggle = new EventEmitter<void>();

  private router = inject(Router);
  readonly themeService = inject(ThemeService);

  // Computed classes para header y logo
  headerClasses = computed(() => {
    const baseClass = 'header-base';
    const styleClass = this.useGradient ? 'gradient-header' : 'adaptive-header';
    return [baseClass, styleClass];
  });

  logoClasses = computed(() => {
    const baseClass = 'logo-base';

    if (this.useGradient) {
      return [baseClass, 'logo-white'];
    }

    const isDark = this.themeService.isDarkMode();
    const themeClass = isDark ? 'logo-dark' : 'logo-adaptive';
    return [baseClass, themeClass];
  });

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  navigateHome(): void {
    this.router.navigate(['/dashboard']);
  }

  // Getter para debugging
}
