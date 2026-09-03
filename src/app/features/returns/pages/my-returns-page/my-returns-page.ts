import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NotificationService } from '../../../../core/services/notification.service';
import { ApiError } from '../../../../shared/models/api-error.model';
import { ReturnsService } from '../../data-access/returns.service';
import { ReturnRequest } from '../../models/return.models';

@Component({
  selector: 'app-my-returns-page',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './my-returns-page.html',
})
export class MyReturnsPage {
  private readonly service = inject(ReturnsService);
  private readonly notifications = inject(NotificationService);
  protected readonly items = signal<ReturnRequest[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() { this.load(); }

  protected async cancel(item: ReturnRequest): Promise<void> {
    if (!(await this.notifications.confirm('Se cancelará esta solicitud de devolución.'))) return;
    this.service.cancel(item.id).subscribe({
      next: (updated) => {
        this.items.update((items) => items.map((candidate) => candidate.id === updated.id ? updated : candidate));
        void this.notifications.success('Solicitud cancelada.');
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
