import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ApiError } from '../../../../shared/models/api-error.model';
import { OrdersService } from '../../data-access/orders.service';
import { Order } from '../../models/order.models';

@Component({
  selector: 'app-my-orders-page',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './my-orders-page.html',
})
export class MyOrdersPage {
  private readonly service = inject(OrdersService);
  protected readonly items = signal<Order[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.service.listMine().subscribe({
      next: (response) => { this.items.set(response.items); this.loading.set(false); },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.loading.set(false); },
    });
  }

  protected print(): void { window.print(); }
}
