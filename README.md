# Sanfer Event Management - Documentación del Proyecto

## Descripción General

Sanfer Event Management es una aplicación web desarrollada en **Angular 19** para la gestión integral de eventos. Permite crear eventos, gestionar participantes, organizar grupos, programar actividades y administrar agendas de manera eficiente.

## Arquitectura y Scaffolding

### Estructura de Carpetas

```
src/
├── app/
│   ├── core/                    # Funcionalidad central
│   │   ├── dtos/               # Data Transfer Objects
│   │   ├── models/             # Interfaces y tipos
│   │   └── services/           # Servicios globales
│   ├── features/               # Módulos por funcionalidad
│   │   ├── events/             # Gestión de eventos
│   │   ├── agenda/             # Programación de actividades
│   │   ├── groups/             # Organización de grupos
│   │   ├── users/              # Gestión de usuarios
│   │   └── dashboard/          # Panel principal
│   ├── layout/                 # Componentes de layout
│   │   ├── main-layout/        # Layout principal con sidebar
│   │   └── simple-layout/      # Layout simple
│   ├── shared/                 # Componentes reutilizables
│   │   ├── components/         # Componentes compartidos
│   │   ├── modals/             # Modales
│   │   └── pipes/              # Pipes personalizados
│   └── styles/                 # Estilos globales y temas
├── environments/               # Configuraciones de entorno
└── assets/                     # Recursos estáticos
```

### Patrón de Arquitectura

La aplicación sigue una **arquitectura modular** basada en:

- **Feature Modules**: Cada funcionalidad principal está organizada en su propio módulo
- **Core Module**: Contiene servicios singleton y funcionalidad central
- **Shared Module**: Componentes y utilidades reutilizables
- **Lazy Loading**: Carga diferida de módulos para optimizar performance

## Tecnologías Principales

- **Angular 19** con Standalone Components
- **Angular Material 19** para UI/UX
- **Angular Signals** para manejo de estado reactivo
- **RxJS** para programación reactiva
- **SCSS** con sistema de temas personalizados
- **TypeScript** con tipado estricto

## Scaffolding y Convenciones

### Estructura de Feature Module

Cada feature sigue esta estructura estándar:

```
features/events/
├── components/          # Componentes específicos del feature
│   ├── event-card/     # Tarjeta de evento
│   ├── event-overview/ # Vista general del evento
│   └── event-*-list/   # Listas (usuarios, grupos, agenda)
├── pages/              # Páginas/vistas principales
│   ├── events-list/    # Lista de eventos
│   └── event-details/  # Detalle del evento
└── events.routes.ts    # Rutas del módulo
```

### Convenciones de Naming

- **Componentes**: `kebab-case` (ej: `event-card.component.ts`)
- **Servicios**: `PascalCase` con sufijo Service (ej: `EventsService`)
- **Interfaces**: `PascalCase` con sufijo adecuado (ej: `AppEvent`, `CreateEventDto`)
- **Archivos**: `kebab-case` con tipo (ej: `event.interface.ts`, `events.service.ts`)

## Core - Funcionalidad Central

### Models (Interfaces)

**Principales entidades:**

```typescript
// AppEvent - Evento principal
interface AppEvent {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  campus?: string;
  dressCode?: string;
  groups?: EventGroup[];
  users?: EventUserAssignment[];
  agendas?: EventAgenda[];
}

// EventGroup - Grupos de participantes
interface EventGroup {
  id: string;
  name: string;
  color: string;
  assignments?: EventUserAssignment[];
}

// EventAgenda - Actividades programadas
interface EventAgenda {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  location?: string;
  groups: EventGroup[];
}
```

### DTOs (Data Transfer Objects)

Para comunicación con el backend:

- `CreateEventDto` - Crear eventos
- `UpdateEventDto` - Actualizar eventos
- `CreateEventGroupDto` - Crear grupos
- `CreateEventAgendumDto` - Crear actividades

### Services

**EventsService**: Gestión principal de eventos con Angular Signals

```typescript
// Estado reactivo con signals
readonly events = signal<AppEvent[]>([]);
readonly loading = signal<boolean>(false);
readonly error = signal<string | null>(null);

// Métodos principales
getAllEvents(): Observable<AppEvent[]>
createEvent(eventData: CreateEventDto): Observable<AppEvent>
updateEvent(id: string, eventData: UpdateEventDto): Observable<AppEvent>
```

**Otros servicios clave:**

- `GroupsService` - Gestión de grupos
- `AgendaService` - Gestión de agenda
- `UsersService` - Gestión de usuarios
- `ThemeService` - Manejo de temas claro/oscuro
- `ModalService` - Gestión centralizada de modales

## Componentes Compartidos

### ReusableTableComponent

Componente de tabla reutilizable con funcionalidades avanzadas:

```typescript
interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  type?: "text" | "number" | "date" | "custom";
}

interface TableConfig {
  showPagination?: boolean;
  pageSize?: number;
  sortable?: boolean;
  stickyHeader?: boolean;
}
```

**Características:**

- Paginación integrada
- Ordenamiento por columnas
- Selección múltiple
- Templates personalizados
- Estados de carga y error
- Acciones por fila y bulk actions

### Sistema de Modales

Modales preconstruidos y reutilizables:

- `CreateEventModalComponent` - Crear/editar eventos
- `CreateGroupModalComponent` - Crear/editar grupos
- `CreateAgendaModalComponent` - Crear/editar actividades
- `BulkUsersModalComponent` - Carga masiva de usuarios desde Excel
- `ConfirmModalComponent` - Confirmaciones

### Header y Sidebar

- **HeaderComponent**: Barra superior con navegación, tema toggle y menú usuario
- **SidebarComponent**: Navegación lateral responsive con lazy loading

## Sistema de Temas

Implementado con **Angular Material 19** y CSS Custom Properties:

### Temas Disponibles

- **Light Theme**: Tema claro por defecto
- **Dark Theme**: Tema oscuro
- **Auto Theme**: Se adapta a las preferencias del sistema

### Colores Principales (Paleta Sanfer)

```scss
--sanfer-primary: #ef3b42; // Rojo Sanfer
--sanfer-accent: #3fa4c5; // Azul complementario
--sanfer-success: #81c181; // Verde
--sanfer-warning: #ff9800; // Naranja
--sanfer-danger: #ef3b42; // Rojo (error)
```

### Gradientes y Efectos

```scss
--sanfer-gradient-hero: linear-gradient(135deg, #ef3b42 0%, #3fa4c5 100%);
--sanfer-shadow-sm: 0 2px 8px rgba(239, 59, 66, 0.1);
```

## Flujo de Datos y Estado

### Manejo de Estado

La aplicación utiliza **Angular Signals** para manejo de estado reactivo:

```typescript
// En servicios
private readonly _events = signal<AppEvent[]>([]);
readonly events = this._events.asReadonly();

// En componentes
readonly selectedEvent = signal<AppEvent | null>(null);
readonly filteredEvents = computed(() => {
  return this.allEvents().filter(event =>
    event.status === 'active'
  );
});
```

### Comunicación con Backend

- **Base URL**: Configurada en `environment.ts`
- **HTTP Client**: Con interceptors para manejo de errores
- **Error Handling**: Centralizado con fallbacks y mensajes usuario-friendly

## Routing y Lazy Loading

### Estructura de Rutas

```typescript
// app.routes.ts
const routes: Routes = [
  { path: "", redirectTo: "events", pathMatch: "full" },
  {
    path: "events",
    loadComponent: () => import("./layout/main-layout/main-layout.component"),
    children: [
      {
        path: "",
        loadChildren: () => import("./features/events/events.routes"),
      },
    ],
  },
];
```

### Navegación Principales

- `/events` - Lista de eventos
- `/events/:id` - Detalle del evento con pestañas:
  - Grupos
  - Usuarios
  - Agenda

## Patrones de Desarrollo

### Standalone Components

Todos los componentes son standalone (Angular 19):

```typescript
@Component({
  selector: "app-event-card",
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: "./event-card.component.html",
  styleUrl: "./event-card.component.scss",
})
export class EventCardComponent {
  @Input() event!: AppEvent;
  @Output() eventClick = new EventEmitter<AppEvent>();
}
```

### Reactive Programming

Uso extensivo de RxJS y Signals:

```typescript
// Combinando Observables y Signals
ngOnInit() {
  this.eventsService.getAllEvents().subscribe({
    next: (events) => this.events.set(events),
    error: (error) => this.error.set(error.message)
  });
}
```

### Error Handling

Manejo consistente de errores:

```typescript
private handleError(operation: string) {
  return (error: any): Observable<any> => {
    console.error(`${operation} failed:`, error);
    this.showMessage(`Error en ${operation}`, 'error');
    return of(null);
  };
}
```

## Responsive Design

### Breakpoints

```scss
// Mobile first approach
@media (max-width: 480px) {
  /* Mobile */
}
@media (max-width: 768px) {
  /* Tablet */
}
@media (max-width: 1024px) {
  /* Desktop small */
}
```

### Layout Adaptativo

- **Mobile**: Sidebar como overlay, navegación simplificada
- **Desktop**: Sidebar fijo, navegación completa
- **Responsive tables**: Adaptación automática en pantallas pequeñas

## Optimizaciones

### Performance

- **Lazy Loading**: Módulos cargados bajo demanda
- **OnPush Strategy**: Detección de cambios optimizada
- **Track By Functions**: Para listas grandes
- **Signals**: Estado reactivo eficiente

### Bundle Size

- **Tree Shaking**: Eliminación de código no utilizado
- **Standalone Components**: Importaciones granulares
- **Dynamic Imports**: Carga diferida de modales y features

## Guía de Desarrollo

### Agregar Nueva Funcionalidad

1. **Crear feature module**: `ng g c features/nueva-feature`
2. **Definir interfaces**: En `core/models/`
3. **Crear servicio**: En `core/services/`
4. **Implementar componentes**: Siguiendo estructura estándar
5. **Configurar rutas**: En `app.routes.ts`

### Agregar Nuevo Modal

1. **Crear componente**: En `shared/components/modals/`
2. **Definir interfaces**: Para data y result
3. **Registrar en ModalService**: Para gestión centralizada
4. **Implementar estilos**: Siguiendo convenciones

### Convenciones de Código

- **Tipado estricto**: TypeScript strict mode
- **Interfaces explícitas**: Para todos los datos
- **Error boundaries**: Try-catch en operaciones críticas
- **Logging consistente**: Console.error para debugging

## Configuración de Entornos

### Development

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000/api",
  defaultTheme: "dark",
};
```

### Production

```typescript
export const environment = {
  production: true,
  apiUrl: "https://sanfer-backend-production.up.railway.app/api",
  defaultTheme: "light",
};
```

---

Esta documentación proporciona las bases necesarias para entender y desarrollar sobre la aplicación Sanfer Event Management. La arquitectura modular y las convenciones establecidas facilitan el mantenimiento y la escalabilidad del proyecto.
