import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Material imports
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventsService } from '@core/services/events.service';
interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  children?: MenuItem[];
  disabled?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatBadgeModule,
    MatTooltipModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Output() closeSidebar = new EventEmitter<void>();

  private router = inject(Router);
  private eventsService = inject(EventsService);

  readonly menuItems: MenuItem[] = [
    // {
    //   label: 'Principal',
    //   icon: 'dashboard',
    //   route: '/dashboard',
    // },
    {
      label: 'Gestión de Eventos',
      icon: 'event',
      route: '',
      children: [
        {
          label: 'Todos los Eventos',
          icon: 'event_note',
          route: '',
          badge: this.eventsService.events().length,
        },
      ],
    },
    {
      label: 'Participantes',
      icon: 'people',
      route: '',
      children: [
        {
          label: 'Usuarios',
          icon: 'person',
          route: '/users',
          disabled: true, // Hasta que implementemos la selección de evento
        },
        {
          label: 'Grupos',
          icon: 'groups',
          route: '/groups',
          disabled: true, // Hasta que implementemos la selección de evento
        },
      ],
    },
    {
      label: 'Programación',
      icon: 'schedule',
      route: '',
      children: [
        {
          label: 'Agenda',
          icon: 'calendar_today',
          route: '/agenda',
          disabled: true,
        },
        {
          label: 'Actividades',
          icon: 'event_available',
          route: '/agenda/activities',
          disabled: true,
        },
      ],
    },
    {
      label: 'Configuración',
      icon: 'settings',
      route: '/settings',
      disabled: true,
    },
  ];

  onItemClick(item: MenuItem): void {
    if (item.disabled) {
      return;
    }

    // Emitir evento para que el layout maneje el cierre
    // El layout decidirá si cerrar o no según el dispositivo
    this.closeSidebar.emit();
  }

  // Debug info
  get debugInfo() {
    return {
      totalMenuItems: this.menuItems.length,
      eventsCount: this.eventsService.events().length,
      currentRoute: this.router.url,
    };
  }
}
