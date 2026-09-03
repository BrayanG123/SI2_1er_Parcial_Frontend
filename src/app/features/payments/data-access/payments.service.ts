import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/config/api-url.token';
import { Payment } from '../models/payment.models';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getByOrder(orderId: string): Observable<Payment | null> {
    return this.http.get<Payment | null>(`${this.apiUrl}/payments/orders/${orderId}`);
  }

  initiate(orderId: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/payments/orders/${orderId}`, null);
  }

  confirm(paymentId: string, result: 'APROBAR' | 'RECHAZAR'): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/payments/${paymentId}/confirm`, {
      resultado_prueba: result,
    });
  }
}
