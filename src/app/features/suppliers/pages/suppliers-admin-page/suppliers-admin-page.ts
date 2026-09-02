import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NotificationService } from '../../../../core/services/notification.service';
import { ApiError } from '../../../../shared/models/api-error.model';
import { SuppliersAdminService } from '../../data-access/suppliers-admin.service';
import { Supplier } from '../../models/supplier.models';

@Component({ selector: 'app-suppliers-admin-page', imports: [ReactiveFormsModule], templateUrl: './suppliers-admin-page.html' })
export class SuppliersAdminPage {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(SuppliersAdminService);
  private readonly notifications = inject(NotificationService);
  protected readonly items = signal<Supplier[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly page = signal(1);
  protected readonly total = signal(0);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly pageSize = 10;
  protected readonly search = this.fb.nonNullable.control('');
  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]], nit: [''], telefono: [''],
    email: ['', Validators.email], direccion: [''],
  });

  constructor() { this.load(); }

  protected save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    const data = { nombre: value.nombre, nit: value.nit || null, telefono: value.telefono || null, email: value.email || null, direccion: value.direccion || null, activo: true };
    const request = this.editingId()
      ? this.service.update(this.editingId()!, { ...data, activo: undefined })
      : this.service.create(data);
    this.saving.set(true);
    request.subscribe({
      next: () => { this.cancelEdit(); this.load(); this.saving.set(false); },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.saving.set(false); },
    });
  }

  protected edit(item: Supplier): void {
    this.editingId.set(item.id);
    this.form.setValue({ nombre: item.nombre, nit: item.nit ?? '', telefono: item.telefono ?? '', email: item.email ?? '', direccion: item.direccion ?? '' });
  }
  protected cancelEdit(): void { this.editingId.set(null); this.form.reset({ nombre: '', nit: '', telefono: '', email: '', direccion: '' }); }
  protected async toggle(item: Supplier): Promise<void> {
    if (!(await this.notifications.confirm(`¿Deseas ${item.activo ? 'desactivar' : 'activar'} ${item.nombre}?`))) return;
    this.service.update(item.id, { activo: !item.activo }).subscribe({ next: () => this.load(), error: (error: ApiError) => this.errorMessage.set(error.message) });
  }
  protected async remove(item: Supplier): Promise<void> {
    if (!(await this.notifications.confirm(`¿Eliminar el proveedor ${item.nombre}?`))) return;
    this.service.delete(item.id).subscribe({ next: () => this.load(), error: (error: ApiError) => this.errorMessage.set(error.message) });
  }
  protected applySearch(): void { this.page.set(1); this.load(); }
  protected changePage(delta: number): void { this.page.update((value) => value + delta); this.load(); }
  protected hasNext(): boolean { return this.page() * this.pageSize < this.total(); }
  private load(): void {
    this.loading.set(true);
    this.service.list(this.page(), this.pageSize, this.search.value).subscribe({
      next: (response) => { this.items.set(response.items); this.total.set(response.total); this.loading.set(false); },
      error: (error: ApiError) => { this.errorMessage.set(error.message); this.loading.set(false); },
    });
  }
}
