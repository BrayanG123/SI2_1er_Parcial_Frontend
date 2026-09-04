import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/config/api-url.token';
import {
  DashboardReport,
  InventoryReport,
  ReportFilters,
  ReportOptions,
  ReservationReport,
  ReturnReport,
  SalesReport,
} from '../models/report.models';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  options(): Observable<ReportOptions> {
    return this.http.get<ReportOptions>(`${this.apiUrl}/reports/options`);
  }

  dashboard(filters: ReportFilters = {}): Observable<DashboardReport> {
    return this.http.get<DashboardReport>(`${this.apiUrl}/reports/dashboard`, {
      params: this.params(filters),
    });
  }

  sales(filters: ReportFilters = {}): Observable<SalesReport> {
    return this.http.get<SalesReport>(`${this.apiUrl}/reports/sales`, {
      params: this.params(filters),
    });
  }

  inventory(branchId?: string): Observable<InventoryReport> {
    const params = branchId ? new HttpParams().set('branch_id', branchId) : undefined;
    return this.http.get<InventoryReport>(`${this.apiUrl}/reports/inventory`, { params });
  }

  reservations(filters: ReportFilters = {}): Observable<ReservationReport> {
    return this.http.get<ReservationReport>(`${this.apiUrl}/reports/reservations`, {
      params: this.params(filters),
    });
  }

  returns(filters: ReportFilters = {}): Observable<ReturnReport> {
    return this.http.get<ReturnReport>(`${this.apiUrl}/reports/returns`, {
      params: this.params(filters),
    });
  }

  private params(filters: ReportFilters): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) params = params.set(key, value);
    }
    return params;
  }
}
