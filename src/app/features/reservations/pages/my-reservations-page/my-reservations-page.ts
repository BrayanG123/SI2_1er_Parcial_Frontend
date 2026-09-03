import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NotificationService } from '../../../../core/services/notification.service';
import { ApiError } from '../../../../shared/models/api-error.model';
import { ReservationsService } from '../../data-access/reservations.service';
import { Reservation, ReservationStatus } from '../../models/reservation.models';
import { OrdersService } from '../../../orders/data-access/orders.service';

@Component({
  selector: 'app-my-reservations-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './my-reservations-page.html',
})
export class MyReservationsPage {
  private readonly service = inject(ReservationsService);
  private readonly notifications = inject(NotificationService);
  private readonly orders = inject(OrdersService);
  protected readonly items = signal<Reservation[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly purchaseQuantities = signal<Record<string, Record<string, number>>>({});

  constructor() {
    this.load();
  }

  protected canCancel(status: ReservationStatus): boolean {
    return ['PENDIENTE', 'CONFIRMADA', 'PREPARADA'].includes(status);
  }

  protected statusLabel(status: ReservationStatus): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  protected setPurchaseQuantity(reservationId: string, variantId: string, event: Event): void {
    const value = Math.max(0, Number((event.target as HTMLInputElement).value) || 0);
    this.purchaseQuantities.update((all) => ({
      ...all,
      [reservationId]: { ...all[reservationId], [variantId]: value },
    }));
  }

  protected async buy(item: Reservation): Promise<void> {
    const selected = this.purchaseQuantities()[item.id] ?? {};
    const details = item.detalles
      .map((detail) => ({
        variante_id: detail.variante_id,
        cantidad: Math.min(selected[detail.variante_id] ?? 0, detail.cantidad),
      }))
      .filter((detail) => detail.cantidad > 0);
    if (!details.length) {
      this.errorMessage.set('Selecciona al menos una prenda reservada para comprar.');
      return;
    }
    if (!(await this.notifications.confirm('Las prendas no seleccionadas se liberarán al crear el pedido.'))) return;
    this.orders.checkoutReservation(item.id, details).subscribe({
      next: (order) => {
        this.items.update((items) => items.map((candidate) => candidate.id === item.id ? { ...candidate, estado: 'COMPLETADA' } : candidate));
        void this.notifications.success(`Pedido ${order.numero} creado por Bs ${order.total}.`);
      },
      error: (error: ApiError) => this.errorMessage.set(error.message),
    });
  }

  protected async cancel(item: Reservation): Promise<void> {
    if (!(await this.notifications.confirm('Se liberarán todas las prendas de esta reserva.'))) return;
    this.service.cancel(item.id).subscribe({
      next: (updated) => {
        this.items.update((items) => items.map((candidate) => candidate.id === updated.id ? updated : candidate));
        void this.notifications.success('La reserva fue cancelada y el stock quedó liberado.');
      },
      error: (error: ApiError) => this.errorMessage.set(error.message),
    });
  }

  private load(): void {
    this.service.listMine().subscribe({
      next: (response) => { this.items.set(response.items); this.loading.set(false); },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.loading.set(false); },
    });
  }
}
