import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { NotificationService } from '../../../../core/services/notification.service';
import { ApiError } from '../../../../shared/models/api-error.model';
import { OrdersService } from '../../../orders/data-access/orders.service';
import { Order } from '../../../orders/models/order.models';
import { ReturnsService } from '../../data-access/returns.service';

@Component({
  selector: 'app-return-create-page',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './return-create-page.html',
})
export class ReturnCreatePage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orders = inject(OrdersService);
  private readonly returns = inject(ReturnsService);
  private readonly notifications = inject(NotificationService);
  protected readonly order = signal<Order | null>(null);
  protected readonly quantities = signal<Record<string, number>>({});
  protected readonly motives = signal<Record<string, string>>({});
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    motivo_general: ['', [Validators.maxLength(500)]],
  });

  constructor() {
    this.orders.getMine(this.route.snapshot.paramMap.get('id')!).subscribe({
      next: (order) => { this.order.set(order); this.loading.set(false); },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.loading.set(false); },
    });
  }

  protected setQuantity(detailId: string, maximum: number, event: Event): void {
    const raw = Number((event.target as HTMLInputElement).value);
    const quantity = Number.isInteger(raw) ? Math.min(Math.max(raw, 0), maximum) : 0;
    this.quantities.update((values) => ({ ...values, [detailId]: quantity }));
  }

  protected setMotive(detailId: string, event: Event): void {
    this.motives.update((values) => ({
      ...values,
      [detailId]: (event.target as HTMLInputElement).value,
    }));
  }

  protected async submit(): Promise<void> {
    const order = this.order();
    if (!order || this.form.invalid) return;
    const details = order.detalles
      .map((detail) => ({
        detalle_pedido_id: detail.id,
        cantidad: this.quantities()[detail.id] ?? 0,
        motivo: this.motives()[detail.id]?.trim() || null,
      }))
      .filter((detail) => detail.cantidad > 0);
    if (!details.length) {
      this.errorMessage.set('Selecciona al menos una unidad para devolver.');
      return;
    }
    if (!(await this.notifications.confirm('Se enviará la solicitud para revisión de la sucursal.'))) return;
    this.saving.set(true);
    this.errorMessage.set(null);
    this.returns.create({
      pedido_id: order.id,
      motivo_general: this.form.controls.motivo_general.value.trim() || null,
      detalles: details,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        void this.notifications.success('Solicitud de devolución registrada.');
        void this.router.navigate(['/devoluciones']);
      },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.saving.set(false); },
    });
  }
}
