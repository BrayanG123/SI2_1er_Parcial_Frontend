import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { ApiError } from '../../../../shared/models/api-error.model';
import { ReportsService } from '../../data-access/reports.service';
import {
  DashboardReport,
  ReportOptions,
  ReportSection,
} from '../../models/report.models';

@Component({
  selector: 'app-reports-dashboard-page',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, ReactiveFormsModule],
  templateUrl: './reports-dashboard-page.html',
})
export class ReportsDashboardPage {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ReportsService);

  protected readonly options = signal<ReportOptions>({ sucursales: [] });
  protected readonly report = signal<DashboardReport | null>(null);
  protected readonly section = signal<ReportSection>('ventas');
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly filters = this.fb.nonNullable.group({
    branch_id: [''],
    date_from: [''],
    date_to: [''],
  });

  protected readonly maximumDailySales = computed(() =>
    Math.max(0, ...(this.report()?.ventas.por_dia.map((item) => Number(item.monto)) ?? [])),
  );
  protected readonly maximumReservationState = computed(() =>
    Math.max(0, ...(this.report()?.reservas.por_estado.map((item) => item.cantidad) ?? [])),
  );
  protected readonly maximumReturnState = computed(() =>
    Math.max(0, ...(this.report()?.devoluciones.por_estado.map((item) => item.cantidad) ?? [])),
  );

  constructor() {
    forkJoin({
      options: this.service.options(),
      report: this.service.dashboard(),
    }).subscribe({
      next: ({ options, report }) => {
        this.options.set(options);
        this.report.set(report);
        if (options.sucursales.length === 1) {
          this.filters.controls.branch_id.setValue(options.sucursales[0].id);
        }
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.loading.set(false);
      },
    });
  }

  protected load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.service.dashboard(this.filters.getRawValue()).subscribe({
      next: (report) => {
        this.report.set(report);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.loading.set(false);
      },
    });
  }

  protected clear(): void {
    const onlyBranch = this.options().sucursales.length === 1
      ? this.options().sucursales[0].id
      : '';
    this.filters.reset({ branch_id: onlyBranch, date_from: '', date_to: '' });
    this.load();
  }

  protected show(section: ReportSection): void {
    this.section.set(section);
  }

  protected dailyWidth(amount: string): number {
    return this.percentage(Number(amount), this.maximumDailySales());
  }

  protected reservationWidth(quantity: number): number {
    return this.percentage(quantity, this.maximumReservationState());
  }

  protected returnWidth(quantity: number): number {
    return this.percentage(quantity, this.maximumReturnState());
  }

  protected stateLabel(state: string): string {
    return state.toLowerCase().replaceAll('_', ' ');
  }

  private percentage(value: number, maximum: number): number {
    return maximum > 0 ? Math.max(3, (value / maximum) * 100) : 0;
  }
}
