import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/config/api-url.token';
import { Cart } from '../models/cart.models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  get(): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/cart`);
  }

  add(variantId: string, quantity = 1): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/cart/items`, {
      variante_id: variantId,
      cantidad: quantity,
    });
  }

  update(itemId: string, quantity: number): Observable<Cart> {
    return this.http.patch<Cart>(`${this.apiUrl}/cart/items/${itemId}`, {
      cantidad: quantity,
    });
  }

  remove(itemId: string): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/cart/items/${itemId}`);
  }

  clear(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cart`);
  }
}
