import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/config/api-url.token';
import { PaginatedResponse } from '../../../shared/models/paginated-response.model';
import {
  Order,
  OrderChannel,
  OrderFilters,
  OrderOptions,
  PosVariant,
} from '../models/order.models';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  options(): Observable<OrderOptions> {
    return this.http.get<OrderOptions>(`${this.apiUrl}/orders/options`);
  }

  checkoutCart(branchId: string, channel: Exclude<OrderChannel, 'POS'> = 'WEB'): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders/checkout`, {
      sucursal_id: branchId,
      canal: channel,
    });
  }

  checkoutReservation(
    reservationId: string,
    details: { variante_id: string; cantidad: number }[],
  ): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders/from-reservation/${reservationId}`, {
      canal: 'WEB',
      detalles: details,
    });
  }

  listMine(page = 1, pageSize = 20): Observable<PaginatedResponse<Order>> {
    const params = new HttpParams().set('page', page).set('page_size', pageSize);
    return this.http.get<PaginatedResponse<Order>>(`${this.apiUrl}/orders/mine`, { params });
  }

  getMine(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/mine/${orderId}`);
  }

  listManage(
    page = 1,
    pageSize = 20,
    filters: OrderFilters = {},
  ): Observable<PaginatedResponse<Order>> {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    for (const [key, value] of Object.entries(filters)) if (value) params = params.set(key, value);
    return this.http.get<PaginatedResponse<Order>>(`${this.apiUrl}/orders/manage`, { params });
  }

  searchPosVariants(sku: string, branchId?: string): Observable<PosVariant[]> {
    let params = new HttpParams().set('sku', sku.trim());
    if (branchId) params = params.set('branch_id', branchId);
    return this.http.get<PosVariant[]>(`${this.apiUrl}/orders/pos/variants`, { params });
  }

  createPos(data: {
    sucursal_id: string;
    cliente_id: string | null;
    detalles: { variante_id: string; cantidad: number }[];
  }): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders/pos`, data);
  }
}
