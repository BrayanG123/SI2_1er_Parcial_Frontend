import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { NotificationService } from '../../../../core/services/notification.service';
import { ApiError } from '../../../../shared/models/api-error.model';
import { ReservationDraftService } from '../../data-access/reservation-draft.service';
import { ReservationsService } from '../../data-access/reservations.service';

@Component({
  selector: 'app-reservation-create-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reservation-create-page.html',
})
export class ReservationCreatePage {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ReservationsService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  protected readonly draft = inject(ReservationDraftService);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly branchName = computed(() => this.draft.items()[0]?.sucursal_nombre ?? '');
  protected readonly cityName = computed(() => this.draft.items()[0]?.ciudad_nombre ?? '');
  protected readonly minDate = this.localDate(new Date());
  protected readonly form = this.fb.nonNullable.group({
    fecha_visita: [this.minDate, Validators.required],
    hora_aproximada: [''],
  });

  protected changeQuantity(variantId: string, event: Event): void {
    this.draft.setQuantity(variantId, Number((event.target as HTMLInputElement).value));
  }

  protected submit(): void {
    if (this.form.invalid || this.draft.items().length === 0 || !this.draft.branchId()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);
    const values = this.form.getRawValue();
    this.service
      .create({
        sucursal_id: this.draft.branchId()!,
        fecha_visita: values.fecha_visita,
        hora_aproximada: values.hora_aproximada || null,
        detalles: this.draft.items().map((item) => ({
          variante_id: item.variante_id,
          cantidad: item.cantidad,
        })),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.draft.clear();
          void this.notifications.success('Tu reserva fue registrada y la sucursal ya puede verla.');
          void this.router.navigate(['/reservas']);
        },
        error: (error: ApiError) => {
          this.saving.set(false);
          this.errorMessage.set(error.message);
        },
      });
  }

  private localDate(value: Date): string {
    const offset = value.getTimezoneOffset() * 60_000;
    return new Date(value.getTime() - offset).toISOString().slice(0, 10);
  }
}
