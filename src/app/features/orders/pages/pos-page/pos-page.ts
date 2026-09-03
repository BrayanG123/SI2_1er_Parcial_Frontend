import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NotificationService } from '../../../../core/services/notification.service';
import { ApiError } from '../../../../shared/models/api-error.model';
import { OrdersService } from '../../data-access/orders.service';
import { Order, OrderOptions, PosVariant } from '../../models/order.models';

interface PosLine extends PosVariant { cantidad: number; }

@Component({
  selector: 'app-pos-page',
  imports: [CurrencyPipe, ReactiveFormsModule],
  templateUrl: './pos-page.html',
})
export class PosPage {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(OrdersService);
  private readonly notifications = inject(NotificationService);
  protected readonly options = signal<OrderOptions>({ sucursales: [] });
  protected readonly results = signal<PosVariant[]>([]);
  protected readonly lines = signal<PosLine[]>([]);
  protected readonly receipt = signal<Order | null>(null);
  protected readonly searching = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly total = computed(() => this.lines().reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0));
  protected readonly form = this.fb.nonNullable.group({
    branch_id: ['', Validators.required], sku: ['', Validators.required], cliente_id: [''],
  });

  constructor() {
    this.service.options().subscribe({
      next: (options) => { this.options.set(options); if (options.sucursales.length === 1) this.form.controls.branch_id.setValue(options.sucursales[0].id); },
      error: (error: ApiError) => this.errorMessage.set(error.message),
    });
  }

  protected search(): void {
    if (!this.form.controls.branch_id.value || !this.form.controls.sku.value.trim()) { this.form.markAllAsTouched(); return; }
    this.searching.set(true);
    this.service.searchPosVariants(this.form.controls.sku.value, this.form.controls.branch_id.value).subscribe({
      next: (items) => { this.results.set(items); this.searching.set(false); },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.searching.set(false); },
    });
  }

  protected add(item: PosVariant): void {
    const existing = this.lines().find((line) => line.variante_id === item.variante_id);
    if (existing && existing.cantidad >= item.stock_disponible) return;
    this.lines.update((lines) => existing
      ? lines.map((line) => line.variante_id === item.variante_id ? { ...line, cantidad: line.cantidad + 1 } : line)
      : [...lines, { ...item, cantidad: 1 }]);
  }

  protected changeQuantity(item: PosLine, event: Event): void {
    const quantity = Number((event.target as HTMLInputElement).value);
    if (!Number.isInteger(quantity) || quantity < 1) return;
    this.lines.update((lines) => lines.map((line) => line.variante_id === item.variante_id ? { ...line, cantidad: Math.min(quantity, line.stock_disponible) } : line));
  }

  protected remove(item: PosLine): void { this.lines.update((lines) => lines.filter((line) => line.variante_id !== item.variante_id)); }

  protected async sell(): Promise<void> {
    if (!this.form.controls.branch_id.value || this.lines().length === 0) return;
    if (!(await this.notifications.confirm('Se descontará el inventario y se emitirá el comprobante POS.'))) return;
    this.saving.set(true);
    this.service.createPos({
      sucursal_id: this.form.controls.branch_id.value,
      cliente_id: this.form.controls.cliente_id.value.trim() || null,
      detalles: this.lines().map((line) => ({ variante_id: line.variante_id, cantidad: line.cantidad })),
    }).subscribe({
      next: (order) => { this.receipt.set(order); this.lines.set([]); this.results.set([]); this.saving.set(false); },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.saving.set(false); },
    });
  }

  protected print(): void { window.print(); }
  protected newSale(): void { this.receipt.set(null); this.form.controls.sku.setValue(''); }
}
