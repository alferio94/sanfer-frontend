import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';

import { Speaker } from '@core/models/speaker.interface';
import { environment } from '../../../environments/environment';
import { CreateSpeakerDto, UpdateSpeakerDto } from '@core/dtos';

@Injectable({
  providedIn: 'root',
})
export class SpeakersService {
  private http = inject(HttpClient);

  // Signals para estado local
  private readonly _speakers = signal<Speaker[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Getters públicos
  readonly speakers = this._speakers.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Endpoints
  private readonly baseUrl = '/speaker/';

  // Obtener speakers por evento
  getSpeakersByEvent(eventId: string): Observable<Speaker[]> {
    return this.http
      .get<Speaker[]>(`${environment.apiUrl}${this.baseUrl}event/${eventId}`)
      .pipe(
        catchError((error) => {
          console.error('Error loading speakers:', error);
          this._error.set('Error al cargar los speakers');
          this._loading.set(false);
          return of([]);
        }),
      );
  }

  // Crear speaker para un evento
  createSpeakerForEvent(
    speakerData: CreateSpeakerDto,
  ): Observable<Speaker | null> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .post<Speaker>(`${environment.apiUrl}${this.baseUrl}`, speakerData)
      .pipe(
        tap((newSpeaker) => {
          const currentSpeakers = this._speakers();
          this._speakers.set([...currentSpeakers, newSpeaker]);
          this._loading.set(false);
        }),
        catchError((error) => {
          console.error('Error creating speaker:', error);
          this._error.set('Error al crear el speaker');
          this._loading.set(false);
          return of(null);
        }),
      );
  }

  // Actualizar speaker
  updateSpeaker(
    speakerId: string,
    speakerData: UpdateSpeakerDto,
  ): Observable<Speaker | null> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .put<Speaker>(
        `${environment.apiUrl}${this.baseUrl}${speakerId}`,
        speakerData,
      )
      .pipe(
        tap((updatedSpeaker) => {
          const currentSpeakers = this._speakers();
          const updatedSpeakers = currentSpeakers.map((speaker) =>
            speaker.id === speakerId ? updatedSpeaker : speaker,
          );
          this._speakers.set(updatedSpeakers);
          this._loading.set(false);
        }),
        catchError((error) => {
          console.error('Error updating speaker:', error);
          this._error.set('Error al actualizar el speaker');
          this._loading.set(false);
          return of(null);
        }),
      );
  }

  // Eliminar speaker
  deleteSpeaker(speakerId: string): Observable<boolean> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .delete<void>(`${environment.apiUrl}${this.baseUrl}${speakerId}`)
      .pipe(
        tap(() => {
          const currentSpeakers = this._speakers();
          const filteredSpeakers = currentSpeakers.filter(
            (speaker) => speaker.id !== speakerId,
          );
          this._speakers.set(filteredSpeakers);
          this._loading.set(false);
        }),
        map(() => true),
        catchError((error) => {
          console.error('Error deleting speaker:', error);
          this._error.set('Error al eliminar el speaker');
          this._loading.set(false);
          return of(false);
        }),
      );
  }

  // Limpiar error
  clearError(): void {
    this._error.set(null);
  }
}
