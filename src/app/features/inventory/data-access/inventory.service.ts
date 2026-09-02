import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/config/api-url.token';
import { PaginatedResponse } from '../../../shared/models/paginated-response.model';
import {
  AdjustmentWrite,
  InventoryFilters,
  InventoryItem,
  InventoryMovement,
  InventoryOptions,
  ReceiptWrite,
} from '../models/inventory.models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  options(): Observable<InventoryOptions> {
    return this.http.get<InventoryOptions>(`${this.apiUrl}/inventory/options`);
  }

  list(
    page = 1,
    pageSize = 20,
    filters: InventoryFilters = {},
  ): Observable<PaginatedResponse<InventoryItem>> {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    for (const [key, value] of Object.entries(filters)) {
      if (value) params = params.set(key, value);
    }
    return this.http.get<PaginatedResponse<InventoryItem>>(`${this.apiUrl}/inventory`, {
      params,
    });
  }

  movements(
    inventoryId: string,
    page = 1,
    pageSize = 50,
  ): Observable<PaginatedResponse<InventoryMovement>> {
    const params = new HttpParams().set('page', page).set('page_size', pageSize);
    return this.http.get<PaginatedResponse<InventoryMovement>>(
      `${this.apiUrl}/inventory/${inventoryId}/movements`,
      { params },
    );
  }

  receive(data: ReceiptWrite): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.apiUrl}/inventory/receipts`, data);
  }

  adjust(data: AdjustmentWrite): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.apiUrl}/inventory/adjustments`, data);
  }
}
