import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnDestroy, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { finalize, forkJoin, switchMap, take, takeWhile, timer } from 'rxjs';

import { NotificationService } from '../../../../core/services/notification.service';
import { ApiError } from '../../../../shared/models/api-error.model';
import { OrdersService } from '../../../orders/data-access/orders.service';
import { Order } from '../../../orders/models/order.models';
import { PaymentsService } from '../../data-access/payments.service';
import { StripeBrowserService } from '../../data-access/stripe-browser.service';
import { Payment } from '../../models/payment.models';

@Component({
  selector: 'app-payment-page',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './payment-page.html',
})
export class PaymentPage implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly orders = inject(OrdersService);
  private readonly payments = inject(PaymentsService);
  private readonly stripeBrowser = inject(StripeBrowserService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly orderId = this.route.snapshot.paramMap.get('id')!;
  private stripe: Stripe | null = null;
  private stripeElements: StripeElements | null = null;
  private stripePaymentElement: StripePaymentElement | null = null;
  protected readonly order = signal<Order | null>(null);
  protected readonly payment = signal<Payment | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly stripeReady = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    forkJoin({
      order: this.orders.getMine(this.orderId),
      payment: this.payments.getByOrder(this.orderId),
    }).subscribe({
      next: ({ order, payment }) => {
        this.order.set(order);
        this.payment.set(payment);
        this.loading.set(false);
        if (payment?.metodo === 'STRIPE' && payment.estado === 'PENDIENTE') {
          this.resumeStripeSession();
        }
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.stripePaymentElement?.unmount();
  }

  protected initiate(): void {
    const order = this.order();
    if (!order || order.estado !== 'CREADO') return;
    this.saving.set(true);
    this.errorMessage.set(null);
    this.payments.initiate(order.id).subscribe({
      next: (payment) => {
        this.payment.set(payment);
        this.saving.set(false);
        if (payment.metodo === 'STRIPE') this.scheduleStripeMount(payment);
      },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.saving.set(false); },
    });
  }

  protected async confirmStripe(): Promise<void> {
    const payment = this.payment();
    if (
      !payment || payment.metodo !== 'STRIPE' || payment.estado !== 'PENDIENTE'
      || !this.stripe || !this.stripeElements
    ) return;

    this.saving.set(true);
    this.errorMessage.set(null);
    let result;
    try {
      result = await this.stripe.confirmPayment({
        elements: this.stripeElements,
        redirect: 'if_required',
        confirmParams: { return_url: window.location.href },
      });
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'No se pudo comunicar con Stripe.',
      );
      this.saving.set(false);
      return;
    }
    if (result.error) {
      this.errorMessage.set(result.error.message ?? 'Stripe no pudo procesar el pago.');
      this.saving.set(false);
      return;
    }

    void this.notifications.success('Stripe recibió el pago. Estamos verificando la confirmación segura.');
    this.pollPaymentStatus();
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

  private resumeStripeSession(): void {
    this.saving.set(true);
    this.payments.initiate(this.orderId).subscribe({
      next: (payment) => {
        this.payment.set(payment);
        this.saving.set(false);
        this.scheduleStripeMount(payment);
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.saving.set(false);
      },
    });
  }

  private scheduleStripeMount(payment: Payment): void {
    this.stripeReady.set(false);
    setTimeout(() => void this.mountStripe(payment));
  }

  private async mountStripe(payment: Payment): Promise<void> {
    if (!payment.client_secret || !payment.publishable_key) {
      this.errorMessage.set('La sesión segura de Stripe está incompleta. Intenta recargar la página.');
      return;
    }
    try {
      this.stripePaymentElement?.unmount();
      this.stripe = await this.stripeBrowser.load(payment.publishable_key);
      if (!this.stripe) throw new Error('No se pudo cargar Stripe.js.');
      this.stripeElements = this.stripe.elements({
        clientSecret: payment.client_secret,
        appearance: { theme: 'stripe' },
      });
      this.stripePaymentElement = this.stripeElements.create('payment', {
        layout: 'tabs',
      });
      this.stripePaymentElement.mount('#stripe-payment-element');
      this.stripeReady.set(true);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'No se pudo inicializar el formulario seguro de Stripe.',
      );
    }
  }

  private pollPaymentStatus(): void {
    timer(0, 1000).pipe(
      take(12),
      switchMap(() => this.payments.getByOrder(this.orderId)),
      takeWhile((payment) => payment?.estado === 'PENDIENTE', true),
      finalize(() => this.saving.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (payment) => {
        if (!payment) return;
        this.payment.update((current) => ({ ...payment, client_secret: current?.client_secret }));
        if (payment.estado === 'APROBADO' || payment.estado === 'REEMBOLSADO') {
          this.order.update((order) => order ? { ...order, estado: 'PAGADO' } : order);
          void this.notifications.success('Pago confirmado por Stripe.');
        } else if (payment.estado === 'RECHAZADO') {
          this.order.update((order) => order ? { ...order, estado: 'CANCELADO' } : order);
          this.errorMessage.set('Stripe rechazó el pago. El pedido fue cancelado y el inventario repuesto.');
        }
      },
      error: (error: ApiError) => this.errorMessage.set(error.message),
      complete: () => {
        if (this.payment()?.estado === 'PENDIENTE') {
          this.errorMessage.set('El pago sigue pendiente de confirmación. Puedes recargar esta página en unos segundos.');
        }
      },
    });
  }
}
