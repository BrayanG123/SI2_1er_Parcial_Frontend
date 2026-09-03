import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { NotificationService } from '../../../../core/services/notification.service';
import { ApiError } from '../../../../shared/models/api-error.model';
import { OrdersService } from '../../../orders/data-access/orders.service';
import { Order } from '../../../orders/models/order.models';
import { PaymentsService } from '../../data-access/payments.service';
import { Payment } from '../../models/payment.models';

@Component({
  selector: 'app-payment-page',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './payment-page.html',
})
export class PaymentPage {
  private readonly route = inject(ActivatedRoute);
  private readonly orders = inject(OrdersService);
  private readonly payments = inject(PaymentsService);
  private readonly notifications = inject(NotificationService);
  protected readonly order = signal<Order | null>(null);
  protected readonly payment = signal<Payment | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    const orderId = this.route.snapshot.paramMap.get('id')!;
    forkJoin({
      order: this.orders.getMine(orderId),
      payment: this.payments.getByOrder(orderId),
    }).subscribe({
      next: ({ order, payment }) => {
        this.order.set(order);
        this.payment.set(payment);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.loading.set(false);
      },
    });
  }

  protected initiate(): void {
    const order = this.order();
    if (!order || order.estado !== 'CREADO') return;
    this.saving.set(true);
    this.errorMessage.set(null);
    this.payments.initiate(order.id).subscribe({
      next: (payment) => { this.payment.set(payment); this.saving.set(false); },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.saving.set(false); },
    });
  }

  protected async confirm(result: 'APROBAR' | 'RECHAZAR'): Promise<void> {
    const payment = this.payment();
    if (!payment || payment.estado !== 'PENDIENTE') return;
    const message = result === 'APROBAR'
      ? 'La pasarela de prueba responderá con un pago aprobado.'
      : 'La pasarela de prueba rechazará el pago, cancelará el pedido y repondrá el inventario.';
    if (!(await this.notifications.confirm(message))) return;
    this.saving.set(true);
    this.errorMessage.set(null);
    this.payments.confirm(payment.id, result).subscribe({
      next: (updated) => {
        this.payment.set(updated);
        this.order.update((order) => order
          ? { ...order, estado: updated.estado === 'APROBADO' ? 'PAGADO' : 'CANCELADO' }
          : order);
        this.saving.set(false);
        void this.notifications.success(
          updated.estado === 'APROBADO' ? 'Pago de prueba aprobado.' : 'Pago rechazado y pedido cancelado.',
        );
      },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.saving.set(false); },
    });
  }
}
