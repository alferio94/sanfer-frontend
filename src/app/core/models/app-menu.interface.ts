// src/app/core/models/app-menu.interface.ts

/**
 * Interface representing the App Menu configuration for an event.
 * Each event has exactly one menu configuration (1:1 relationship).
 * Controls which sections/features are visible in the mobile app.
 */
export interface AppMenu {
  id: string;
  eventId: string;
  transporte: boolean;
  alimentos: boolean;
  codigoVestimenta: boolean;
  ponentes: boolean;
  encuestas: boolean;
  hotel: boolean;
  agenda: boolean;
  atencionMedica: boolean;
  sede: boolean;
}

/**
 * Type representing only the configurable menu sections (excluding id and eventId)
 */
export type AppMenuConfig = Omit<AppMenu, 'id' | 'eventId'>;

/**
 * Menu section metadata for UI rendering
 */
export interface AppMenuSection {
  key: keyof AppMenuConfig;
  label: string;
  description: string;
  icon: string;
}

/**
 * Predefined menu sections with their UI metadata
 */
export const APP_MENU_SECTIONS: AppMenuSection[] = [
  {
    key: 'transporte',
    label: 'Transporte',
    description: 'Seccion de transporte/traslados',
    icon: 'directions_bus',
  },
  {
    key: 'alimentos',
    label: 'Alimentos',
    description: 'Seccion de comidas/catering',
    icon: 'restaurant',
  },
  {
    key: 'codigoVestimenta',
    label: 'Codigo de Vestimenta',
    description: 'Informacion de dress code',
    icon: 'checkroom',
  },
  {
    key: 'ponentes',
    label: 'Ponentes',
    description: 'Lista de speakers/ponentes',
    icon: 'record_voice_over',
  },
  {
    key: 'encuestas',
    label: 'Encuestas',
    description: 'Encuestas del evento',
    icon: 'poll',
  },
  {
    key: 'hotel',
    label: 'Hotel',
    description: 'Informacion de hospedaje',
    icon: 'hotel',
  },
  {
    key: 'agenda',
    label: 'Agenda',
    description: 'Calendario/agenda del evento',
    icon: 'event',
  },
  {
    key: 'atencionMedica',
    label: 'Atencion Medica',
    description: 'Servicios medicos',
    icon: 'medical_services',
  },
  {
    key: 'sede',
    label: 'Sede',
    description: 'Informacion del venue/sede',
    icon: 'location_on',
  },
];

/**
 * Default menu configuration (all sections enabled)
 */
export const DEFAULT_APP_MENU_CONFIG: AppMenuConfig = {
  transporte: true,
  alimentos: true,
  codigoVestimenta: true,
  ponentes: true,
  encuestas: true,
  hotel: true,
  agenda: true,
  atencionMedica: true,
  sede: true,
};
