import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { EventUser } from '@core/models';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/event-user/`;
  constructor() {}

  gerUserAssigments(eventId: string): Observable<EventUser[]> {
    return this.http.get<EventUser[]>(`${this.baseUrl}${eventId}`).pipe(
      catchError((error) => {
        console.error('Error fetching user assignments:', error);
        return of([]); // Retorna un array vacío en caso de error
      }),
    );
  }
}
