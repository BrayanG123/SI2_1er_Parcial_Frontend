import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Role } from '../../../../core/auth/auth.models';
import { NotificationService } from '../../../../core/services/notification.service';
import { ApiError } from '../../../../shared/models/api-error.model';
import { UsersAdminService } from '../../data-access/users-admin.service';

const PROTECTED_ROLES = ['cliente', 'administrador', 'encargado', 'cajero'];

@Component({
  selector: 'app-roles-admin-page',
  imports: [ReactiveFormsModule],
  templateUrl: './roles-admin-page.html',
})
export class RolesAdminPage {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersAdminService);
  private readonly notifications = inject(NotificationService);

  protected readonly roles = signal<Role[]>([]);
  protected readonly editingId = signal<string | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.pattern(/^[a-z][a-z0-9_-]+$/)]],
    descripcion: [''],
  });

  constructor() {
    this.loadRoles();
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const data = this.form.getRawValue();
    const editingId = this.editingId();
    const request = editingId
      ? this.usersService.updateRole(editingId, data)
      : this.usersService.createRole(data);
    request.subscribe({
      next: (role) => {
        this.roles.update((roles) =>
          editingId ? roles.map((item) => (item.id === role.id ? role : item)) : [...roles, role],
        );
        this.cancelEdit();
      },
      error: (error: ApiError) => this.errorMessage.set(error.message),
    });
  }

  protected edit(role: Role): void {
    this.editingId.set(role.id);
    this.form.setValue({ nombre: role.nombre, descripcion: role.descripcion ?? '' });
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset({ nombre: '', descripcion: '' });
  }

  protected isProtected(role: Role): boolean {
    return PROTECTED_ROLES.includes(role.nombre);
  }

  protected async deleteRole(role: Role): Promise<void> {
    const confirmed = await this.notifications.confirm(`¿Eliminar el rol ${role.nombre}?`);
    if (!confirmed) {
      return;
    }
    this.usersService.deleteRole(role.id).subscribe({
      next: () => this.roles.update((roles) => roles.filter((item) => item.id !== role.id)),
      error: (error: ApiError) => this.errorMessage.set(error.message),
    });
  }

  private loadRoles(): void {
    this.usersService.listRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.loading.set(false);
      },
    });
  }
}
