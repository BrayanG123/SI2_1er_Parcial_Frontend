import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/config/api-url.token';
import { PaginatedResponse } from '../../../shared/models/paginated-response.model';
import { Category, CategoryWrite } from '../models/category.models';

@Injectable({ providedIn: 'root' })
export class CategoriesAdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  list(page = 1, pageSize = 10, query = ''): Observable<PaginatedResponse<Category>> {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    if (query.trim()) params = params.set('q', query.trim());
    return this.http.get<PaginatedResponse<Category>>(`${this.apiUrl}/categories`, { params });
  }

  create(data: CategoryWrite): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, data);
  }

  update(id: string, data: Partial<CategoryWrite>): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/categories/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }
}
