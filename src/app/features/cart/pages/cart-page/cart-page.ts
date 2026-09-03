import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { NotificationService } from '../../../../core/services/notification.service';
import { ApiError } from '../../../../shared/models/api-error.model';
import { CartService } from '../../data-access/cart.service';
import { Cart, CartItem } from '../../models/cart.models';
import { OrdersService } from '../../../orders/data-access/orders.service';
import { Order, OrderOptions } from '../../../orders/models/order.models';

@Component({
  selector: 'app-cart-page',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './cart-page.html',
})
export class CartPage {
  private readonly fb = inject(FormBuilder);
  private readonly cartService = inject(CartService);
  private readonly ordersService = inject(OrdersService);
  private readonly notifications = inject(NotificationService);
  protected readonly cart = signal<Cart | null>(null);
  protected readonly options = signal<OrderOptions>({ sucursales: [] });
  protected readonly receipt = signal<Order | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly checkoutForm = this.fb.nonNullable.group({
    branch_id: ['', Validators.required],
  });

  constructor() {
    forkJoin({ cart: this.cartService.get(), options: this.ordersService.options() }).subscribe({
      next: ({ cart, options }) => {
        this.cart.set(cart);
        this.options.set(options);
        if (options.sucursales.length === 1) this.checkoutForm.controls.branch_id.setValue(options.sucursales[0].id);
        this.loading.set(false);
      },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.loading.set(false); },
    });
  }

  protected update(item: CartItem, event: Event): void {
    const quantity = Number((event.target as HTMLInputElement).value);
    if (!Number.isInteger(quantity) || quantity < 1) return;
    this.cartService.update(item.id, quantity).subscribe({
      next: (cart) => this.cart.set(cart),
      error: (error: ApiError) => this.errorMessage.set(error.message),
    });
  }

  protected remove(item: CartItem): void {
    this.cartService.remove(item.id).subscribe({
      next: (cart) => this.cart.set(cart),
      error: (error: ApiError) => this.errorMessage.set(error.message),
    });
  }

  protected async clear(): Promise<void> {
    if (!(await this.notifications.confirm('Se retirarán todas las prendas del carrito.'))) return;
    this.cartService.clear().subscribe({
      next: () => this.cart.update((cart) => cart ? { ...cart, detalles: [], subtotal_estimado: 0 } : cart),
      error: (error: ApiError) => this.errorMessage.set(error.message),
    });
  }

  protected async checkout(): Promise<void> {
    if (this.checkoutForm.invalid || !this.cart()?.detalles.length) {
      this.checkoutForm.markAllAsTouched();
      return;
    }
    if (!(await this.notifications.confirm('El backend volverá a validar precios y existencias antes de crear el pedido.'))) return;
    this.saving.set(true);
    this.errorMessage.set(null);
    this.ordersService.checkoutCart(this.checkoutForm.controls.branch_id.value).subscribe({
      next: (order) => {
        this.receipt.set(order);
        this.cart.update((cart) => cart ? { ...cart, detalles: [], subtotal_estimado: 0 } : cart);
        this.saving.set(false);
        void this.notifications.success('Pedido creado. El pago se habilitará en el siguiente módulo.');
      },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.saving.set(false); },
    });
  }

  protected print(): void { window.print(); }
}
