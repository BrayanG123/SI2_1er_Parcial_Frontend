import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';

import { API_URL } from '../config/api-url.token';
import { LoginRequest, RegistrationRequest, TokenResponse, User } from './auth.models';

const TOKEN_KEY = 'ropa_access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly currentUser = signal<User | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly roles = computed(() => this.currentUser()?.roles.map((role) => role.nombre) ?? []);

  login(data: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/auth/login`, data).pipe(
      tap((response) => {
        sessionStorage.setItem(TOKEN_KEY, response.access_token);
        this.currentUser.set(response.user);
      }),
    );
  }

  register(data: RegistrationRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, data);
  }

  restoreSession(): Observable<User | null> {
    if (!this.token()) {
      return of(null);
    }
    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
      tap((user) => this.currentUser.set(user)),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  logout(): void {
    this.clearSession();
  }

  token(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  hasAnyRole(requiredRoles: readonly string[]): boolean {
    return requiredRoles.some((role) => this.roles().includes(role));
  }

  private clearSession(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    this.currentUser.set(null);
  }
}
