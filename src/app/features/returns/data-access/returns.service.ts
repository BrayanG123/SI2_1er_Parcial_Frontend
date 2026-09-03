import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/config/api-url.token';
import { PaginatedResponse } from '../../../shared/models/paginated-response.model';
import {
  ReturnCreatePayload,
  ReturnRequest,
  ReturnStatus,
} from '../models/return.models';

@Injectable({ providedIn: 'root' })
export class ReturnsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  create(payload: ReturnCreatePayload): Observable<ReturnRequest> {
    return this.http.post<ReturnRequest>(`${this.apiUrl}/returns`, payload);
  }

  listMine(page = 1, pageSize = 20): Observable<PaginatedResponse<ReturnRequest>> {
    const params = new HttpParams().set('page', page).set('page_size', pageSize);
    return this.http.get<PaginatedResponse<ReturnRequest>>(`${this.apiUrl}/returns/mine`, { params });
  }

  cancel(returnId: string): Observable<ReturnRequest> {
    return this.http.post<ReturnRequest>(`${this.apiUrl}/returns/${returnId}/cancel`, null);
  }

  listManage(
    page = 1,
    pageSize = 20,
    filters: { branch_id?: string; state?: ReturnStatus | '' } = {},
  ): Observable<PaginatedResponse<ReturnRequest>> {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    if (filters.branch_id) params = params.set('branch_id', filters.branch_id);
    if (filters.state) params = params.set('state', filters.state);
    return this.http.get<PaginatedResponse<ReturnRequest>>(`${this.apiUrl}/returns/manage`, { params });
  }

  transition(
    returnId: string,
    state: ReturnStatus,
    options: { reingresar_stock?: boolean; generar_reembolso?: boolean } = {},
  ): Observable<ReturnRequest> {
    return this.http.patch<ReturnRequest>(`${this.apiUrl}/returns/manage/${returnId}/status`, {
      estado: state,
      reingresar_stock: options.reingresar_stock ?? true,
      generar_reembolso: options.generar_reembolso ?? true,
    });
  }
}
