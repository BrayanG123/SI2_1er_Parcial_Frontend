import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/config/api-url.token';
import { PaginatedResponse } from '../../../shared/models/paginated-response.model';
import { Supplier, SupplierWrite } from '../models/supplier.models';

@Injectable({ providedIn: 'root' })
export class SuppliersAdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  list(page = 1, pageSize = 10, query = ''): Observable<PaginatedResponse<Supplier>> {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    if (query.trim()) params = params.set('q', query.trim());
    return this.http.get<PaginatedResponse<Supplier>>(`${this.apiUrl}/suppliers`, { params });
  }
  create(data: SupplierWrite): Observable<Supplier> { return this.http.post<Supplier>(`${this.apiUrl}/suppliers`, data); }
  update(id: string, data: Partial<SupplierWrite>): Observable<Supplier> { return this.http.patch<Supplier>(`${this.apiUrl}/suppliers/${id}`, data); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/suppliers/${id}`); }
}
