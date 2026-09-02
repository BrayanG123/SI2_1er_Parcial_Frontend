import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/config/api-url.token';
import { PaginatedResponse } from '../../../shared/models/paginated-response.model';
import { Branch, BranchWrite, City, CityWrite } from '../models/branch.models';

@Injectable({ providedIn: 'root' })
export class BranchesAdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  listCities(page = 1, pageSize = 10, query = ''): Observable<PaginatedResponse<City>> {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    if (query.trim()) params = params.set('q', query.trim());
    return this.http.get<PaginatedResponse<City>>(`${this.apiUrl}/cities`, { params });
  }

  createCity(data: CityWrite): Observable<City> {
    return this.http.post<City>(`${this.apiUrl}/cities`, data);
  }

  updateCity(cityId: string, data: Partial<CityWrite>): Observable<City> {
    return this.http.patch<City>(`${this.apiUrl}/cities/${cityId}`, data);
  }

  deleteCity(cityId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cities/${cityId}`);
  }

  listBranches(
    page = 1,
    pageSize = 10,
    query = '',
    cityId?: string,
  ): Observable<PaginatedResponse<Branch>> {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    if (query.trim()) params = params.set('q', query.trim());
    if (cityId) params = params.set('city_id', cityId);
    return this.http.get<PaginatedResponse<Branch>>(`${this.apiUrl}/branches`, { params });
  }

  createBranch(data: BranchWrite): Observable<Branch> {
    return this.http.post<Branch>(`${this.apiUrl}/branches`, data);
  }

  updateBranch(branchId: string, data: Partial<BranchWrite>): Observable<Branch> {
    return this.http.patch<Branch>(`${this.apiUrl}/branches/${branchId}`, data);
  }

  deleteBranch(branchId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/branches/${branchId}`);
  }
}
