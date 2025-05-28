// src/app/core/services/events.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, BehaviorSubject, map } from 'rxjs';
import { AppEvent } from '../models/event.interface';
import { CreateEventDto, UpdateEventDto } from '../dtos';
import { environment } from '../../../environments/environment';

export interface EventStats {
  totalEvents: number;
  activeEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalUsers: number;
  totalGroups: number;
}

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private http = inject(HttpClient);

  // Signals para estado local
  private readonly _events = signal<AppEvent[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // BehaviorSubject para operaciones que necesitan ser observables
  private eventsSubject = new BehaviorSubject<AppEvent[]>([]);

  // Getters públicos
  readonly events = this._events.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly events$ = this.eventsSubject.asObservable();

  // Endpoints
  private readonly baseUrl = '/event/';

  constructor() {}

  // Obtener todos los eventos
  getAllEvents(): Observable<AppEvent[]> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<AppEvent[]>(environment.apiUrl + this.baseUrl).pipe(
      tap((events) => {
        // Convertir strings de fecha a Date objects
        const processedEvents = events.map((event) => ({
          ...event,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
        }));

        this._events.set(processedEvents);
        this.eventsSubject.next(processedEvents);
        this._loading.set(false);
      }),
      catchError((error) => {
        this._error.set('Error al cargar los eventos');
        this._loading.set(false);
        console.error('Error loading events:', error);
        return of([]);
      }),
    );
  }

  // Obtener evento por ID
  getEventById(id: string): Observable<AppEvent | null> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<AppEvent>(`${this.baseUrl}/${id}`).pipe(
      tap((event) => {
        // Convertir strings de fecha a Date objects
        const processedEvent = {
          ...event,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
        };

        // Actualizar el evento en la lista local si existe
        const currentEvents = this._events();
        const updatedEvents = currentEvents.map((e) =>
          e.id === id ? processedEvent : e,
        );

        if (!currentEvents.find((e) => e.id === id)) {
          updatedEvents.push(processedEvent);
        }

        this._events.set(updatedEvents);
        this._loading.set(false);
      }),
      catchError((error) => {
        this._error.set('Error al cargar el evento');
        this._loading.set(false);
        console.error('Error loading event:', error);
        return of(null);
      }),
    );
  }

  // Crear nuevo evento
  createEvent(eventData: CreateEventDto): Observable<AppEvent | null> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.post<AppEvent>(this.baseUrl, eventData).pipe(
      tap((newEvent) => {
        const processedEvent = {
          ...newEvent,
          startDate: new Date(newEvent.startDate),
          endDate: new Date(newEvent.endDate),
        };

        // Agregar a la lista local
        const currentEvents = this._events();
        this._events.set([...currentEvents, processedEvent]);
        this.eventsSubject.next([...currentEvents, processedEvent]);
        this._loading.set(false);
      }),
      catchError((error) => {
        this._error.set('Error al crear el evento');
        this._loading.set(false);
        console.error('Error creating event:', error);
        return of(null);
      }),
    );
  }

  // Actualizar evento
  updateEvent(
    id: string,
    eventData: UpdateEventDto,
  ): Observable<AppEvent | null> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.put<AppEvent>(`${this.baseUrl}/${id}`, eventData).pipe(
      tap((updatedEvent) => {
        const processedEvent = {
          ...updatedEvent,
          startDate: new Date(updatedEvent.startDate),
          endDate: new Date(updatedEvent.endDate),
        };

        // Actualizar en la lista local
        const currentEvents = this._events();
        const updatedEvents = currentEvents.map((event) =>
          event.id === id ? processedEvent : event,
        );

        this._events.set(updatedEvents);
        this.eventsSubject.next(updatedEvents);
        this._loading.set(false);
      }),
      catchError((error) => {
        this._error.set('Error al actualizar el evento');
        this._loading.set(false);
        console.error('Error updating event:', error);
        return of(null);
      }),
    );
  }

  // Eliminar evento
  deleteEvent(id: string): Observable<boolean> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      map(() => {
        // Remover de la lista local
        const currentEvents = this._events();
        const filteredEvents = currentEvents.filter((event) => event.id !== id);

        this._events.set(filteredEvents);
        this.eventsSubject.next(filteredEvents);
        this._loading.set(false);
        return true;
      }),
      catchError((error) => {
        this._error.set('Error al eliminar el evento');
        this._loading.set(false);
        console.error('Error deleting event:', error);
        return of(false);
      }),
    );
  }

  // Asignar usuarios a evento
  assignUsersToEvent(eventId: string, users: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/assignment/${eventId}`, users).pipe(
      catchError((error) => {
        console.error('Error assigning users to event:', error);
        return of(null);
      }),
    );
  }

  // Obtener estadísticas de eventos
  getEventStats(): Observable<EventStats> {
    // Como el backend no tiene un endpoint específico para stats,
    // calculamos las estadísticas basadas en los eventos cargados
    const events = this._events();
    const now = new Date();

    const stats: EventStats = {
      totalEvents: events.length,
      activeEvents: events.filter(
        (e) => new Date(e.startDate) <= now && new Date(e.endDate) >= now,
      ).length,
      upcomingEvents: events.filter((e) => new Date(e.startDate) > now).length,
      completedEvents: events.filter((e) => new Date(e.endDate) < now).length,
      totalUsers: events.reduce((sum, e) => sum + (e.users?.length || 0), 0),
      totalGroups: events.reduce((sum, e) => sum + (e.groups?.length || 0), 0),
    };

    return of(stats);
  }

  // Limpiar error
  clearError(): void {
    this._error.set(null);
  }

  // Método de utilidad para verificar si un evento está activo
  isEventActive(event: AppEvent): boolean {
    const now = new Date();
    return new Date(event.startDate) <= now && new Date(event.endDate) >= now;
  }

  // Método de utilidad para verificar si un evento es próximo
  isEventUpcoming(event: AppEvent): boolean {
    const now = new Date();
    return new Date(event.startDate) > now;
  }

  // Método de utilidad para verificar si un evento está completado
  isEventCompleted(event: AppEvent): boolean {
    const now = new Date();
    return new Date(event.endDate) < now;
  }
}
