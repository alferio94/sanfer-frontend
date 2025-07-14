// src/app/core/services/transport.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';

import { Transport } from '@core/models/transport.interface';
import { environment } from '../../../environments/environment';
import { CreateTransportDto, UpdateTransportDto } from '@core/dtos';

@Injectable({
  providedIn: 'root',
})
export class TransportService {
  private http = inject(HttpClient);

  // Signals para estado local
  private readonly _transports = signal<Transport[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Getters públicos
  readonly transports = this._transports.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Endpoints
  private readonly baseUrl = '/event-transport/';

  // Obtener transportes por evento
  getTransportsByEvent(eventId: string): Observable<Transport[]> {
    return this.http
      .get<Transport[]>(`${environment.apiUrl}${this.baseUrl}event/${eventId}`)
      .pipe(
        map((transports) =>
          transports.map((transport) => ({
            ...transport,
            departureTime: new Date(transport.departureTime),
          })),
        ),
        catchError((error) => {
          console.error('Error loading transports:', error);
          this._error.set('Error al cargar los transportes');
          this._loading.set(false);
          return of([]);
        }),
      );
  }

  // Obtener todos los transportes
  getAllTransports(): Observable<Transport[]> {
    return this.http
      .get<Transport[]>(`${environment.apiUrl}${this.baseUrl}`)
      .pipe(
        map((transports) =>
          transports.map((transport) => ({
            ...transport,
            departureTime: new Date(transport.departureTime),
          })),
        ),
        catchError((error) => {
          console.error('Error loading transports:', error);
          this._error.set('Error al cargar los transportes');
          this._loading.set(false);
          return of([]);
        }),
      );
  }

  // Obtener transporte por ID
  getTransportById(id: string): Observable<Transport | null> {
    return this.http
      .get<Transport>(`${environment.apiUrl}${this.baseUrl}${id}`)
      .pipe(
        map((transport) => ({
          ...transport,
          departureTime: new Date(transport.departureTime),
        })),
        catchError((error) => {
          console.error('Error loading transport:', error);
          this._error.set('Error al cargar el transporte');
          this._loading.set(false);
          return of(null);
        }),
      );
  }

  // Crear transporte para un evento
  createTransportForEvent(
    transportData: CreateTransportDto,
  ): Observable<Transport | null> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .post<Transport>(`${environment.apiUrl}${this.baseUrl}`, transportData)
      .pipe(
        map((transport) => ({
          ...transport,
          departureTime: new Date(transport.departureTime),
        })),
        tap((newTransport) => {
          const currentTransports = this._transports();
          this._transports.set([...currentTransports, newTransport]);
          this._loading.set(false);
        }),
        catchError((error) => {
          console.error('Error creating transport:', error);
          this._error.set('Error al crear el transporte');
          this._loading.set(false);
          return of(null);
        }),
      );
  }

  // Actualizar transporte
  updateTransport(
    transportId: string,
    transportData: UpdateTransportDto,
  ): Observable<Transport | null> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .put<Transport>(
        `${environment.apiUrl}${this.baseUrl}${transportId}`,
        transportData,
      )
      .pipe(
        map((transport) => ({
          ...transport,
          departureTime: new Date(transport.departureTime),
        })),
        tap((updatedTransport) => {
          const currentTransports = this._transports();
          const updatedTransports = currentTransports.map((transport) =>
            transport.id === transportId ? updatedTransport : transport,
          );
          this._transports.set(updatedTransports);
          this._loading.set(false);
        }),
        catchError((error) => {
          console.error('Error updating transport:', error);
          this._error.set('Error al actualizar el transporte');
          this._loading.set(false);
          return of(null);
        }),
      );
  }

  // Eliminar transporte
  deleteTransport(transportId: string): Observable<boolean> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .delete<void>(`${environment.apiUrl}${this.baseUrl}${transportId}`)
      .pipe(
        tap(() => {
          const currentTransports = this._transports();
          const filteredTransports = currentTransports.filter(
            (transport) => transport.id !== transportId,
          );
          this._transports.set(filteredTransports);
          this._loading.set(false);
        }),
        map(() => true),
        catchError((error) => {
          console.error('Error deleting transport:', error);
          this._error.set('Error al eliminar el transporte');
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
