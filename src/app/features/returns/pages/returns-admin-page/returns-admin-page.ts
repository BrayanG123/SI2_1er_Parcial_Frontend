import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { NotificationService } from '../../../../core/services/notification.service';
import { ApiError } from '../../../../shared/models/api-error.model';
import { OrdersService } from '../../../orders/data-access/orders.service';
import { OrderOptions } from '../../../orders/models/order.models';
import { ReturnsService } from '../../data-access/returns.service';
import { ReturnRequest, ReturnStatus } from '../../models/return.models';

@Component({
  selector: 'app-returns-admin-page',
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './returns-admin-page.html',
})
export class ReturnsAdminPage {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ReturnsService);
  private readonly orders = inject(OrdersService);
  private readonly notifications = inject(NotificationService);
  protected readonly items = signal<ReturnRequest[]>([]);
  protected readonly options = signal<OrderOptions>({ sucursales: [] });
  protected readonly loading = signal(true);
  protected readonly actionId = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly filters = this.fb.nonNullable.group({ branch_id: [''], state: [''] });
  protected readonly completion = this.fb.nonNullable.group({
    reingresar_stock: [true], generar_reembolso: [true],
  });

  constructor() {
    this.orders.options().subscribe({ next: (options) => this.options.set(options) });
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    const value = this.filters.getRawValue();
    this.service.listManage(1, 20, {
      branch_id: value.branch_id || undefined,
      state: value.state as ReturnStatus | '',
    }).subscribe({
      next: (response) => { this.items.set(response.items); this.loading.set(false); },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.loading.set(false); },
    });
  }

  protected clear(): void { this.filters.reset({ branch_id: '', state: '' }); this.load(); }

  protected async transition(item: ReturnRequest, state: ReturnStatus): Promise<void> {
    const message = state === 'COMPLETADA'
      ? 'Se finalizará la devolución con las opciones de stock y reembolso seleccionadas.'
      : `La devolución cambiará a ${state}.`;
    if (!(await this.notifications.confirm(message))) return;
    this.actionId.set(item.id);
    const flags = this.completion.getRawValue();
    this.service.transition(item.id, state, flags).subscribe({
      next: (updated) => {
        this.items.update((items) => items.map((candidate) => candidate.id === updated.id ? updated : candidate));
        this.actionId.set(null);
        void this.notifications.success('Estado de devolución actualizado.');
      },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.actionId.set(null); },
    });
  }
}
