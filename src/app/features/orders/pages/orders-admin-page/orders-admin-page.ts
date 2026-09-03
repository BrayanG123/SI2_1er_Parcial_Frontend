import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { ApiError } from '../../../../shared/models/api-error.model';
import { OrdersService } from '../../data-access/orders.service';
import { Order, OrderChannel, OrderOptions, OrderStatus } from '../../models/order.models';

@Component({
  selector: 'app-orders-admin-page',
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './orders-admin-page.html',
})
export class OrdersAdminPage {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(OrdersService);
  protected readonly items = signal<Order[]>([]);
  protected readonly options = signal<OrderOptions>({ sucursales: [] });
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly filters = this.fb.nonNullable.group({
    branch_id: [''], channel: ['' as OrderChannel | ''], state: ['' as OrderStatus | ''],
    date_from: [''], date_to: [''],
  });

  constructor() {
    forkJoin({ options: this.service.options(), orders: this.service.listManage(1, 100) }).subscribe({
      next: ({ options, orders }) => { this.options.set(options); this.items.set(orders.items); this.loading.set(false); },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.loading.set(false); },
    });
  }

  protected load(): void {
    this.loading.set(true);
    this.service.listManage(1, 100, this.filters.getRawValue()).subscribe({
      next: (response) => { this.items.set(response.items); this.loading.set(false); },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.loading.set(false); },
    });
  }

  protected clear(): void {
    this.filters.reset({ branch_id: '', channel: '', state: '', date_from: '', date_to: '' });
    this.load();
  }
}
