import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { NotificationService } from '../../../../core/services/notification.service';
import { ApiError } from '../../../../shared/models/api-error.model';
import { ReservationsService } from '../../data-access/reservations.service';
import { Reservation, ReservationStatus } from '../../models/reservation.models';

@Component({
  selector: 'app-branch-reservations-page',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './branch-reservations-page.html',
})
export class BranchReservationsPage {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ReservationsService);
  private readonly notifications = inject(NotificationService);
  protected readonly items = signal<Reservation[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly filters = this.fb.nonNullable.group({
    state: ['' as ReservationStatus | ''],
    visit_from: [''],
    visit_to: [''],
  });

  constructor() { this.load(); }

  protected nextStatus(status: ReservationStatus): ReservationStatus | null {
    const transitions: Partial<Record<ReservationStatus, ReservationStatus>> = {
      PENDIENTE: 'CONFIRMADA', CONFIRMADA: 'PREPARADA', PREPARADA: 'COMPLETADA',
    };
    return transitions[status] ?? null;
  }

  protected actionLabel(status: ReservationStatus): string {
    const labels: Partial<Record<ReservationStatus, string>> = {
      PENDIENTE: 'Confirmar',
      CONFIRMADA: 'Marcar preparada',
      PREPARADA: 'Completar atención',
    };
    return labels[status] ?? '';
  }

  protected applyFilters(): void { this.load(); }
  protected clearFilters(): void { this.filters.reset({ state: '', visit_from: '', visit_to: '' }); this.load(); }

  protected transition(item: Reservation): void {
    const target = this.nextStatus(item.estado);
    if (!target) return;
    this.service.transition(item.id, target).subscribe({
      next: (updated) => this.replace(updated),
      error: (error: ApiError) => this.errorMessage.set(error.message),
    });
  }

  protected async cancel(item: Reservation): Promise<void> {
    if (!(await this.notifications.confirm('Se cancelará la reserva y se liberarán sus prendas.'))) return;
    this.service.cancel(item.id).subscribe({
      next: (updated) => this.replace(updated),
      error: (error: ApiError) => this.errorMessage.set(error.message),
    });
  }

  private replace(updated: Reservation): void {
    this.items.update((items) => items.map((item) => item.id === updated.id ? updated : item));
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.service.listBranch(1, 100, this.filters.getRawValue()).subscribe({
      next: (response) => { this.items.set(response.items); this.loading.set(false); },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.loading.set(false); },
    });
  }
}
