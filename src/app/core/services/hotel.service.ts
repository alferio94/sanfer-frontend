import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';

import { Hotel } from '@core/models/hotel.interface';
import { environment } from '../../../environments/environment';
import { UpdateHotelDto, CreateHotelDto } from '@core/dtos';

@Injectable({
  providedIn: 'root',
})
export class HotelsService {
  private http = inject(HttpClient);

  // Signals para estado local
  private readonly _hotels = signal<Hotel[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Getters públicos
  readonly hotels = this._hotels.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Endpoints
  private readonly baseUrl = '/hotel/';

  // Obtener hoteles por evento
  getHotelsByEvent(eventId: string): Observable<Hotel[]> {
    return this.http
      .get<Hotel[]>(`${environment.apiUrl}${this.baseUrl}event/${eventId}`)
      .pipe(
        catchError((error) => {
          console.error('Error loading hotels:', error);
          this._error.set('Error al cargar los hoteles');
          this._loading.set(false);
          return of([]);
        }),
      );
  }

  // Crear hotel para un evento
  createHotelForEvent(hotelData: CreateHotelDto): Observable<Hotel | null> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .post<Hotel>(`${environment.apiUrl}${this.baseUrl}`, hotelData)
      .pipe(
        tap((newHotel) => {
          const currentHotels = this._hotels();
          this._hotels.set([...currentHotels, newHotel]);
          this._loading.set(false);
        }),
        catchError((error) => {
          console.error('Error creating hotel:', error);
          this._error.set('Error al crear el hotel');
          this._loading.set(false);
          return of(null);
        }),
      );
  }

  // Actualizar hotel
  updateHotel(
    hotelId: string,
    hotelData: UpdateHotelDto,
  ): Observable<Hotel | null> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .put<Hotel>(`${environment.apiUrl}${this.baseUrl}${hotelId}`, hotelData)
      .pipe(
        tap((updatedHotel) => {
          const currentHotels = this._hotels();
          const updatedHotels = currentHotels.map((hotel) =>
            hotel.id === hotelId ? updatedHotel : hotel,
          );
          this._hotels.set(updatedHotels);
          this._loading.set(false);
        }),
        catchError((error) => {
          console.error('Error updating hotel:', error);
          this._error.set('Error al actualizar el hotel');
          this._loading.set(false);
          return of(null);
        }),
      );
  }

  // Eliminar hotel
  deleteHotel(hotelId: string): Observable<boolean> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .delete<void>(`${environment.apiUrl}${this.baseUrl}${hotelId}`)
      .pipe(
        tap(() => {
          const currentHotels = this._hotels();
          const filteredHotels = currentHotels.filter(
            (hotel) => hotel.id !== hotelId,
          );
          this._hotels.set(filteredHotels);
          this._loading.set(false);
        }),
        map(() => true),
        catchError((error) => {
          console.error('Error deleting hotel:', error);
          this._error.set('Error al eliminar el hotel');
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
