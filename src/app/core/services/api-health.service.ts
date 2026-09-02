import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api-url.token';
import { ApiHealth } from '../models/api-health.model';

@Injectable({ providedIn: 'root' })
export class ApiHealthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  check(): Observable<ApiHealth> {
    return this.http.get<ApiHealth>(`${this.apiUrl}/health`);
  }
}
