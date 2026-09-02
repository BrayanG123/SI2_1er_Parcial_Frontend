import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { Role, User } from '../../../../core/auth/auth.models';
import { NotificationService } from '../../../../core/services/notification.service';
import { ApiError } from '../../../../shared/models/api-error.model';
import { BranchSelect } from '../../../branches/components/branch-select/branch-select';
import { BranchesAdminService } from '../../../branches/data-access/branches-admin.service';
import { Branch } from '../../../branches/models/branch.models';
import { UsersAdminService } from '../../data-access/users-admin.service';

@Component({
  selector: 'app-users-admin-page',
  imports: [ReactiveFormsModule, BranchSelect],
  templateUrl: './users-admin-page.html',
})
export class UsersAdminPage {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersAdminService);
  private readonly notifications = inject(NotificationService);
  private readonly branchesService = inject(BranchesAdminService);

  protected readonly users = signal<User[]>([]);
  protected readonly roles = signal<Role[]>([]);
  protected readonly branches = signal<Branch[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['cliente', Validators.required],
    branchId: [''],
  });

  constructor() {
    this.loadData();
  }

  protected createUser(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saving.set(true);
    this.usersService
      .createUser({
        nombres: value.nombres,
        apellidos: value.apellidos,
        email: value.email,
        password: value.password,
        roles: [value.role],
        activo: true,
        sucursal_id: value.branchId || null,
      })
      .subscribe({
        next: (user) => {
          this.users.update((users) => [user, ...users]);
          this.form.reset({ role: 'cliente', branchId: '' });
          this.saving.set(false);
        },
        error: (error: ApiError) => {
          this.errorMessage.set(error.message);
          this.saving.set(false);
        },
      });
  }

  protected toggleActive(user: User): void {
    this.usersService.updateUser(user.id, { activo: !user.activo }).subscribe({
      next: (updated) =>
        this.users.update((users) => users.map((item) => (item.id === updated.id ? updated : item))),
      error: (error: ApiError) => this.errorMessage.set(error.message),
    });
  }

  protected async deleteUser(user: User): Promise<void> {
    const confirmed = await this.notifications.confirm(
      `¿Eliminar la cuenta de ${user.nombres} ${user.apellidos}?`,
    );
    if (!confirmed) {
      return;
    }
    this.usersService.deleteUser(user.id).subscribe({
      next: () => this.users.update((users) => users.filter((item) => item.id !== user.id)),
      error: (error: ApiError) => this.errorMessage.set(error.message),
    });
  }

  private loadData(): void {
    forkJoin({
      users: this.usersService.listUsers(),
      roles: this.usersService.listRoles(),
      branches: this.branchesService.listBranches(1, 100),
    }).subscribe({
      next: ({ users, roles, branches }) => {
        this.users.set(users.items);
        this.roles.set(roles);
        this.branches.set(branches.items);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.loading.set(false);
      },
    });
  }

  protected branchName(branchId: string | null): string {
    return this.branches().find((branch) => branch.id === branchId)?.nombre ?? 'Sin sucursal';
  }
}
