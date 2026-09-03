import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/config/api-url.token';
import { PaginatedResponse } from '../../../shared/models/paginated-response.model';
import {
  BranchReservationFilters,
  Reservation,
  ReservationStatus,
  ReservationWrite,
} from '../models/reservation.models';

@Injectable({ providedIn: 'root' })
export class ReservationsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  create(data: ReservationWrite): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.apiUrl}/reservations`, data);
  }

  listMine(page = 1, pageSize = 20): Observable<PaginatedResponse<Reservation>> {
    const params = new HttpParams().set('page', page).set('page_size', pageSize);
    return this.http.get<PaginatedResponse<Reservation>>(`${this.apiUrl}/reservations/mine`, {
      params,
    });
  }

  cancel(id: string): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.apiUrl}/reservations/${id}/cancel`, {});
  }

  listBranch(
    page = 1,
    pageSize = 20,
    filters: BranchReservationFilters = {},
  ): Observable<PaginatedResponse<Reservation>> {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    for (const [key, value] of Object.entries(filters)) {
      if (value) params = params.set(key, value);
    }
    return this.http.get<PaginatedResponse<Reservation>>(
      `${this.apiUrl}/reservations/branch`,
      { params },
    );
  }

  transition(id: string, state: ReservationStatus): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/reservations/branch/${id}/status`, {
      estado: state,
    });
  }
}
