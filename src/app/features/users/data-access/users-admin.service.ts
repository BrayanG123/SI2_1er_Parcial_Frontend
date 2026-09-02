import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/config/api-url.token';
import { Role, User } from '../../../core/auth/auth.models';
import { PaginatedResponse } from '../../../shared/models/paginated-response.model';

export interface AdminUserCreate {
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  roles: string[];
  activo: boolean;
  sucursal_id?: string | null;
}

export interface RoleWrite {
  nombre?: string;
  descripcion?: string | null;
}

@Injectable({ providedIn: 'root' })
export class UsersAdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  listUsers(page = 1, pageSize = 50): Observable<PaginatedResponse<User>> {
    const params = new HttpParams().set('page', page).set('page_size', pageSize);
    return this.http.get<PaginatedResponse<User>>(`${this.apiUrl}/users`, { params });
  }

  createUser(data: AdminUserCreate): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, data);
  }

  updateUser(userId: string, data: Partial<User> & { roles?: string[] }): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${userId}`, data);
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`);
  }

  listRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }

  createRole(data: Required<Pick<RoleWrite, 'nombre'>> & RoleWrite): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/roles`, data);
  }

  updateRole(roleId: string, data: RoleWrite): Observable<Role> {
    return this.http.patch<Role>(`${this.apiUrl}/roles/${roleId}`, data);
  }

  deleteRole(roleId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/roles/${roleId}`);
  }
}
