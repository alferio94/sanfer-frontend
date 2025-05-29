import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateEventGroupDto, UpdateEventGroupDto } from '@core/dtos';
import { EventGroup } from '@core/models';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/event-group';

  // Crear grupo para evento específico
  createGroupForEvent(
    eventId: string,
    groupData: CreateEventGroupDto,
  ): Observable<EventGroup | null> {
    return this.http
      .post<EventGroup>(
        `${environment.apiUrl}${this.baseUrl}/event/${eventId}`,
        groupData,
      )
      .pipe(
        catchError((error) => {
          console.error('Error creating group:', error);
          return of(null);
        }),
      );
  }

  // Obtener grupos por evento
  getGroupsByEvent(eventId: string): Observable<EventGroup[]> {
    return this.http
      .get<
        EventGroup[]
      >(`${environment.apiUrl}${this.baseUrl}/event/${eventId}`)
      .pipe(
        catchError((error) => {
          console.error('Error loading groups:', error);
          return of([]);
        }),
      );
  }

  // Obtener grupo por ID
  getGroupById(id: string): Observable<EventGroup | null> {
    return this.http
      .get<EventGroup>(`${environment.apiUrl}${this.baseUrl}/${id}`)
      .pipe(
        catchError((error) => {
          console.error('Error loading group:', error);
          return of(null);
        }),
      );
  }

  // Actualizar grupo
  updateGroup(
    id: string,
    groupData: UpdateEventGroupDto,
  ): Observable<EventGroup | null> {
    return this.http
      .put<EventGroup>(`${environment.apiUrl}${this.baseUrl}/${id}`, groupData)
      .pipe(
        catchError((error) => {
          console.error('Error updating group:', error);
          return of(null);
        }),
      );
  }

  // Eliminar grupo
  deleteGroup(id: string): Observable<boolean> {
    return this.http
      .delete<void>(`${environment.apiUrl}${this.baseUrl}/${id}`)
      .pipe(
        map(() => true),
        catchError((error) => {
          console.error('Error deleting group:', error);
          return of(false);
        }),
      );
  }
}
