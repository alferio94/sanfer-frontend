// src/app/core/services/agenda.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { EventAgenda } from '../models/agenda.interface';
import { CreateEventAgendumDto, UpdateEventAgendumDto } from '../dtos';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AgendaService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/event-agenda';

  // Crear actividad de agenda
  createAgendaItem(
    agendaData: CreateEventAgendumDto,
  ): Observable<EventAgenda | null> {
    return this.http
      .post<EventAgenda>(`${environment.apiUrl}${this.baseUrl}`, agendaData)
      .pipe(
        catchError((error) => {
          console.error('Error creating agenda item:', error);
          return of(null);
        }),
      );
  }

  // Obtener todas las actividades de agenda
  getAllAgendaItems(): Observable<EventAgenda[]> {
    return this.http
      .get<EventAgenda[]>(`${environment.apiUrl}${this.baseUrl}`)
      .pipe(
        catchError((error) => {
          console.error('Error loading agenda items:', error);
          return of([]);
        }),
      );
  }

  // Obtener actividades de agenda por evento
  getAgendaByEvent(eventId: string): Observable<EventAgenda[]> {
    return this.http
      .get<EventAgenda[]>(`${environment.apiUrl}${this.baseUrl}/${eventId}`)
      .pipe(
        catchError((error) => {
          console.error('Error loading agenda items:', error);
          return of([]);
        }),
      );
  }

  // Obtener actividad por ID
  getAgendaItemById(id: string): Observable<EventAgenda | null> {
    return this.http
      .get<EventAgenda>(`${environment.apiUrl}${this.baseUrl}/${id}`)
      .pipe(
        catchError((error) => {
          console.error('Error loading agenda item:', error);
          return of(null);
        }),
      );
  }

  // Actualizar actividad
  updateAgendaItem(
    id: string,
    agendaData: UpdateEventAgendumDto,
  ): Observable<EventAgenda | null> {
    return this.http
      .put<EventAgenda>(
        `${environment.apiUrl}${this.baseUrl}/${id}`,
        agendaData,
      )
      .pipe(
        catchError((error) => {
          console.error('Error updating agenda item:', error);
          return of(null);
        }),
      );
  }

  // Eliminar actividad
  deleteAgendaItem(id: string): Observable<boolean> {
    return this.http
      .delete<void>(`${environment.apiUrl}${this.baseUrl}/${id}`)
      .pipe(
        map(() => {
          return true; // Retorna true si la eliminación fue exitosa
        }),
        catchError((error) => {
          console.error('Error deleting agenda item:', error);
          return of(false);
        }),
      );
  }
}
