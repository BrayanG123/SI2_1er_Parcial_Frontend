import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/config/api-url.token';
import { Category } from '../../categories/models/category.models';
import { PaginatedResponse } from '../../../shared/models/paginated-response.model';
import {
  Collection, Color, Product, ProductAvailability, ProductFilters, ProductVariant, ProductWrite, Season, Size,
  VariantWrite,
} from '../models/catalog.models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  listPublicProducts(page = 1, pageSize = 12, filters: ProductFilters = {}): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    for (const [key, value] of Object.entries(filters)) if (value) params = params.set(key, value);
    return this.http.get<PaginatedResponse<Product>>(`${this.apiUrl}/catalog/products`, { params });
  }
  getPublicProduct(id: string): Observable<Product> { return this.http.get<Product>(`${this.apiUrl}/catalog/products/${id}`); }
  getPublicAvailability(id: string): Observable<ProductAvailability[]> { return this.http.get<ProductAvailability[]>(`${this.apiUrl}/catalog/products/${id}/availability`); }
  listPublicCategories(): Observable<Category[]> { return this.http.get<Category[]>(`${this.apiUrl}/catalog/categories`); }
  listPublicSizes(): Observable<Size[]> { return this.http.get<Size[]>(`${this.apiUrl}/catalog/sizes`); }
  listPublicColors(): Observable<Color[]> { return this.http.get<Color[]>(`${this.apiUrl}/catalog/colors`); }
  listPublicSeasons(): Observable<Season[]> { return this.http.get<Season[]>(`${this.apiUrl}/catalog/seasons`); }
  listPublicCollections(seasonId?: string): Observable<Collection[]> {
    const params = seasonId ? new HttpParams().set('season_id', seasonId) : undefined;
    return this.http.get<Collection[]>(`${this.apiUrl}/catalog/collections`, { params });
  }

  listAdminProducts(page = 1, pageSize = 50, q = ''): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    if (q.trim()) params = params.set('q', q.trim());
    return this.http.get<PaginatedResponse<Product>>(`${this.apiUrl}/admin/catalog/products`, { params });
  }
  createProduct(data: ProductWrite): Observable<Product> { return this.http.post<Product>(`${this.apiUrl}/admin/catalog/products`, data); }
  updateProduct(id: string, data: Partial<Omit<ProductWrite, 'variantes'>>): Observable<Product> { return this.http.patch<Product>(`${this.apiUrl}/admin/catalog/products/${id}`, data); }
  deleteProduct(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/admin/catalog/products/${id}`); }
  createVariant(productId: string, data: VariantWrite): Observable<ProductVariant> { return this.http.post<ProductVariant>(`${this.apiUrl}/admin/catalog/products/${productId}/variants`, data); }
  updateVariant(id: string, data: Partial<VariantWrite>): Observable<ProductVariant> { return this.http.patch<ProductVariant>(`${this.apiUrl}/admin/catalog/variants/${id}`, data); }
  deleteVariant(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/admin/catalog/variants/${id}`); }

  listSizes(): Observable<Size[]> { return this.http.get<Size[]>(`${this.apiUrl}/admin/catalog/sizes`); }
  createSize(data: Omit<Size, 'id'>): Observable<Size> { return this.http.post<Size>(`${this.apiUrl}/admin/catalog/sizes`, data); }
  updateSize(id: string, data: Partial<Omit<Size, 'id'>>): Observable<Size> { return this.http.patch<Size>(`${this.apiUrl}/admin/catalog/sizes/${id}`, data); }
  deleteSize(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/admin/catalog/sizes/${id}`); }
  listColors(): Observable<Color[]> { return this.http.get<Color[]>(`${this.apiUrl}/admin/catalog/colors`); }
  createColor(data: Omit<Color, 'id'>): Observable<Color> { return this.http.post<Color>(`${this.apiUrl}/admin/catalog/colors`, data); }
  updateColor(id: string, data: Partial<Omit<Color, 'id'>>): Observable<Color> { return this.http.patch<Color>(`${this.apiUrl}/admin/catalog/colors/${id}`, data); }
  deleteColor(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/admin/catalog/colors/${id}`); }
  listSeasons(): Observable<Season[]> { return this.http.get<Season[]>(`${this.apiUrl}/admin/catalog/seasons`); }
  createSeason(data: Omit<Season, 'id'>): Observable<Season> { return this.http.post<Season>(`${this.apiUrl}/admin/catalog/seasons`, data); }
  updateSeason(id: string, data: Partial<Omit<Season, 'id'>>): Observable<Season> { return this.http.patch<Season>(`${this.apiUrl}/admin/catalog/seasons/${id}`, data); }
  deleteSeason(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/admin/catalog/seasons/${id}`); }
  listCollections(): Observable<Collection[]> { return this.http.get<Collection[]>(`${this.apiUrl}/admin/catalog/collections`); }
  createCollection(data: Pick<Collection, 'temporada_id' | 'nombre' | 'descripcion'>): Observable<Collection> { return this.http.post<Collection>(`${this.apiUrl}/admin/catalog/collections`, data); }
  updateCollection(id: string, data: Partial<Pick<Collection, 'temporada_id' | 'nombre' | 'descripcion'>>): Observable<Collection> { return this.http.patch<Collection>(`${this.apiUrl}/admin/catalog/collections/${id}`, data); }
  deleteCollection(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/admin/catalog/collections/${id}`); }
}
