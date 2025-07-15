# Sanfer Event Management - Project Documentation

**A comprehensive Angular 19 application for complete event management including survey functionality.**

## Overview

Sanfer Event Management is a comprehensive web application built with **Angular 19** for complete event management. It enables event creation, participant management, group organization, activity scheduling, agenda administration, hotel management, speaker profiles, transportation coordination, and advanced survey functionality with real-time analytics.

### 🚀 Latest Features

**Survey Management System** - *Recently Implemented*
- ✅ Complete survey creation with multiple question types
- ✅ Entry and exit surveys for events
- ✅ Real-time survey metrics and analytics
- ✅ Dynamic question management with drag & drop
- ✅ Multiple choice, text, rating, and boolean questions
- ✅ Survey response tracking and validation
- ✅ Integration with event details dashboard

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
│   │   ├── surveys/            # Sistema de encuestas ⭐ NEW
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

// Survey - Sistema de encuestas ⭐ NEW
interface Survey {
  id: string;
  title: string;
  description: string;
  type: 'entry' | 'exit';
  isActive: boolean;
  event: { id: string; name: string };
  questions?: SurveyQuestion[];
}

// SurveyQuestion - Preguntas de encuesta
interface SurveyQuestion {
  id: string;
  questionText: string;
  questionType: 'text' | 'multiple_choice' | 'rating' | 'boolean';
  isRequired: boolean;
  order: number;
  options?: string[];
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
- `SurveyService` - Sistema completo de encuestas ⭐ NEW
- `SpeakersService` - Gestión de speakers
- `HotelsService` - Gestión de hoteles
- `TransportService` - Gestión de transportes
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
- `CreateSurveyModalComponent` - Crear/editar encuestas con preguntas ⭐ NEW
- `BulkUsersModalComponent` - Carga masiva de usuarios desde Excel
- `ConfirmModalComponent` - Confirmaciones

### Header y Sidebar

- **HeaderComponent**: Barra superior con navegación, tema toggle y menú usuario
- **SidebarComponent**: Navegación lateral responsive con lazy loading

## 📊 Survey Management System ⭐ NEW

### Overview

The survey system provides comprehensive feedback collection capabilities for events with support for both entry and exit surveys. Features include dynamic question creation, multiple question types, real-time analytics, and seamless integration with the event management workflow.

### Key Features

#### 🎯 Survey Types
- **Entry Surveys**: Collect participant expectations and background information
- **Exit Surveys**: Gather feedback and satisfaction metrics post-event

#### 📝 Question Types
- **Text Questions**: Open-ended responses for detailed feedback
- **Multiple Choice**: Predefined options with single selection
- **Rating Scale**: 1-10 numerical ratings for quantitative feedback
- **Boolean (Yes/No)**: Simple binary questions

#### 🔧 Advanced Features
- **Drag & Drop**: Reorder questions with intuitive interface
- **Question Validation**: Ensure data quality with required fields
- **Dynamic Options**: Add/remove multiple choice options on the fly
- **Survey Metrics**: Real-time response tracking and analytics
- **Question Duplication**: Speed up survey creation with smart copying

### Components Architecture

#### SurveyService
```typescript
// Comprehensive survey management
getSurveysByEvent(eventId: string): Observable<Survey[]>
createSurveyWithQuestions(surveyData: CreateSurveyRequest): Observable<Survey>
getSurveyMetrics(surveyId: string): Observable<SurveyMetrics>
submitSurveyResponse(responseData: SubmitSurveyRequest): Observable<SurveyResponse>
```

#### EventSurveysListComponent
- **Survey Dashboard**: Complete overview with statistics
- **Real-time Metrics**: Response counts and completion rates
- **Action Management**: Create, edit, delete, and view surveys
- **Type Filtering**: Separate views for entry and exit surveys

#### CreateSurveyModalComponent
- **Multi-step Creation**: Survey details + question management
- **Question Builder**: Visual interface for all question types
- **Real-time Validation**: Instant feedback on form completion
- **Advanced UI**: Expansion panels, drag & drop, and dynamic forms

### API Integration

#### Backend Endpoints
```typescript
// Survey Management
POST /survey/with-questions - Create complete survey
PUT /survey/{id}/with-questions - Update survey and questions
GET /survey/event/{eventId} - Get event surveys
GET /survey/{id}/metrics - Get survey analytics

// Response Management
POST /survey-response/submit - Submit user responses
GET /survey-response/check/{surveyId}/{userId} - Check completion
GET /survey-response/survey/{surveyId} - Get all responses
```

#### Data Models
```typescript
// Complete survey creation payload
interface CreateSurveyRequest {
  title: string;
  description: string;
  type: 'entry' | 'exit';
  isActive: boolean;
  eventId: string;
  questions: Array<{
    questionText: string;
    questionType: QuestionType;
    isRequired: boolean;
    order: number;
    options?: string[];
  }>;
}

// Survey analytics and metrics
interface SurveyMetrics {
  surveyId: string;
  title: string;
  type: SurveyType;
  totalResponses: number;
  totalQuestions: number;
  isActive: boolean;
}
```

### User Experience

#### Survey Creation Workflow
1. **Survey Setup**: Define title, description, and type
2. **Question Building**: Add questions with various types
3. **Question Configuration**: Set requirements and ordering
4. **Option Management**: Configure multiple choice options
5. **Validation & Preview**: Ensure survey completeness
6. **Activation**: Make survey available to participants

#### Survey Management Features
- **Visual Question Types**: Icon-coded question identification
- **Status Indicators**: Active/inactive survey states
- **Response Tracking**: Real-time completion metrics
- **Bulk Operations**: Manage multiple surveys efficiently

### Integration Points

#### Event Details Dashboard
- **Surveys Tab**: Dedicated section in event management
- **Quick Stats**: Survey count and response metrics
- **Direct Actions**: Create, edit, and manage surveys inline

#### Mobile App Ready
- **API-First Design**: Complete backend integration
- **Response Validation**: Client-side and server-side validation
- **Offline Support**: Structured for future offline capabilities

### Performance Optimizations

- **Lazy Loading**: Survey components loaded on demand
- **Efficient State Management**: Angular Signals for reactive updates
- **Smart Caching**: Minimize API calls with intelligent caching
- **Optimistic Updates**: Immediate UI feedback for better UX

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
  - Hoteles
  - Speakers
  - Encuestas ⭐ NEW
  - Transportes

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

## 🚀 Recent Implementation Summary

### Survey System Implementation (Latest Update)

The survey management system has been fully integrated into the Sanfer Event Management platform with the following components:

#### ✅ Completed Features

**Core Models & Services**
- `survey.interface.ts` - Complete TypeScript interfaces for surveys, questions, responses, and metrics
- `survey.service.ts` - Comprehensive service with full CRUD operations and analytics
- Updated `event.interface.ts` to include survey relationships

**UI Components**
- `EventSurveysListComponent` - Complete survey dashboard with statistics and management
- `CreateSurveyModalComponent` - Advanced modal for survey creation with drag & drop questions
- Integrated surveys tab in event details page with real-time metrics

**Features Implemented**
- ✅ Survey creation with multiple question types (text, multiple choice, rating, boolean)
- ✅ Dynamic question management with drag & drop reordering
- ✅ Real-time survey metrics and analytics
- ✅ Entry and exit survey type support
- ✅ Question validation and smart form handling
- ✅ Complete API integration with backend endpoints
- ✅ Responsive design with mobile-first approach
- ✅ Integration with existing event management workflow

#### 🔧 Technical Implementation

**Architecture Patterns Used**
- Angular Signals for reactive state management
- Standalone components for optimal bundle size
- FormArray for dynamic question management
- CDK Drag & Drop for question reordering
- Material Design components for consistent UX

**API Integration**
- Complete backend integration following documented API structure
- Error handling with user-friendly messages
- Optimistic updates for better perceived performance
- Smart caching to minimize API calls

**Files Created/Modified**
```
Core:
├── models/survey.interface.ts (NEW)
├── models/index.ts (UPDATED)
├── models/event.interface.ts (UPDATED)
└── services/survey.service.ts (NEW)

Components:
├── event-surveys-list/ (NEW)
│   ├── event-surveys-list.component.ts
│   ├── event-surveys-list.component.html
│   ├── event-surveys-list.component.scss
│   └── event-surveys-list.component.spec.ts
└── create-survey-modal/ (NEW)
    ├── create-survey-modal.component.ts
    ├── create-survey-modal.component.html
    └── create-survey-modal.component.scss

Integration:
├── event-details.component.ts (UPDATED)
├── event-details.component.html (UPDATED)
└── README.md (UPDATED)
```

#### 🎯 Next Steps & Future Enhancements

**Phase 1 - Ready for Testing**
- Survey system is fully implemented and ready for integration testing
- Backend API endpoints are documented and structured
- Mobile app integration points are prepared

**Phase 2 - Potential Enhancements**
- Survey templates for common use cases
- Advanced analytics with charts and visualizations
- Survey response exports (CSV, PDF)
- Conditional logic for dynamic surveys
- Survey scheduling and automation

---

This documentation provides the necessary foundation to understand and develop on the Sanfer Event Management application. The modular architecture and established conventions facilitate project maintenance and scalability. The new survey system adds significant value for event feedback collection and participant engagement tracking.
