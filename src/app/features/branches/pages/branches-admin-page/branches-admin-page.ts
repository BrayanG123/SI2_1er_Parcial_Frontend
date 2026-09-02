import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NotificationService } from '../../../../core/services/notification.service';
import { ApiError } from '../../../../shared/models/api-error.model';
import { CitySelect } from '../../components/city-select/city-select';
import { BranchesAdminService } from '../../data-access/branches-admin.service';
import { Branch, City } from '../../models/branch.models';

@Component({
  selector: 'app-branches-admin-page',
  imports: [ReactiveFormsModule, CitySelect],
  templateUrl: './branches-admin-page.html',
})
export class BranchesAdminPage {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(BranchesAdminService);
  private readonly notifications = inject(NotificationService);

  protected readonly cities = signal<City[]>([]);
  protected readonly cityOptions = signal<City[]>([]);
  protected readonly branches = signal<Branch[]>([]);
  protected readonly loadingCities = signal(true);
  protected readonly loadingBranches = signal(true);
  protected readonly savingCity = signal(false);
  protected readonly savingBranch = signal(false);
  protected readonly editingCityId = signal<string | null>(null);
  protected readonly editingBranchId = signal<string | null>(null);
  protected readonly cityPage = signal(1);
  protected readonly branchPage = signal(1);
  protected readonly cityTotal = signal(0);
  protected readonly branchTotal = signal(0);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly pageSize = 10;

  protected readonly citySearch = this.fb.nonNullable.control('');
  protected readonly branchSearch = this.fb.nonNullable.control('');
  protected readonly cityForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    departamento: [''],
  });
  protected readonly branchForm = this.fb.nonNullable.group({
    ciudad_id: ['', Validators.required],
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    direccion: ['', [Validators.required, Validators.minLength(3)]],
    telefono: [''],
    horario_informativo: ['', [Validators.required, Validators.minLength(2)]],
    activa: [true],
  });

  constructor() {
    this.loadCities();
    this.loadCityOptions();
    this.loadBranches();
  }

  protected saveCity(): void {
    if (this.cityForm.invalid) {
      this.cityForm.markAllAsTouched();
      return;
    }
    const value = this.cityForm.getRawValue();
    const data = { nombre: value.nombre, departamento: value.departamento || null };
    const request = this.editingCityId()
      ? this.service.updateCity(this.editingCityId()!, data)
      : this.service.createCity(data);
    this.savingCity.set(true);
    request.subscribe({
      next: () => {
        this.cancelCityEdit();
        this.loadCities();
        this.loadCityOptions();
        this.savingCity.set(false);
      },
      error: (error: ApiError) => this.handleError(error, this.savingCity),
    });
  }

  protected editCity(city: City): void {
    this.editingCityId.set(city.id);
    this.cityForm.setValue({ nombre: city.nombre, departamento: city.departamento ?? '' });
  }

  protected cancelCityEdit(): void {
    this.editingCityId.set(null);
    this.cityForm.reset({ nombre: '', departamento: '' });
  }

  protected async deleteCity(city: City): Promise<void> {
    if (!(await this.notifications.confirm(`¿Eliminar la ciudad ${city.nombre}?`))) return;
    this.service.deleteCity(city.id).subscribe({
      next: () => {
        this.loadCities();
        this.loadCityOptions();
      },
      error: (error: ApiError) => this.errorMessage.set(error.message),
    });
  }

  protected saveBranch(): void {
    if (this.branchForm.invalid) {
      this.branchForm.markAllAsTouched();
      return;
    }
    const value = this.branchForm.getRawValue();
    const data = { ...value, telefono: value.telefono || null };
    const request = this.editingBranchId()
      ? this.service.updateBranch(this.editingBranchId()!, data)
      : this.service.createBranch(data);
    this.savingBranch.set(true);
    request.subscribe({
      next: () => {
        this.cancelBranchEdit();
        this.loadBranches();
        this.savingBranch.set(false);
      },
      error: (error: ApiError) => this.handleError(error, this.savingBranch),
    });
  }

  protected editBranch(branch: Branch): void {
    this.editingBranchId.set(branch.id);
    this.branchForm.setValue({
      ciudad_id: branch.ciudad_id,
      nombre: branch.nombre,
      direccion: branch.direccion,
      telefono: branch.telefono ?? '',
      horario_informativo: branch.horario_informativo,
      activa: branch.activa,
    });
  }

  protected cancelBranchEdit(): void {
    this.editingBranchId.set(null);
    this.branchForm.reset({
      ciudad_id: '', nombre: '', direccion: '', telefono: '', horario_informativo: '', activa: true,
    });
  }

  protected async toggleBranch(branch: Branch): Promise<void> {
    const action = branch.activa ? 'desactivar' : 'activar';
    if (!(await this.notifications.confirm(`¿Deseas ${action} ${branch.nombre}?`))) return;
    this.service.updateBranch(branch.id, { activa: !branch.activa }).subscribe({
      next: () => this.loadBranches(),
      error: (error: ApiError) => this.errorMessage.set(error.message),
    });
  }

  protected async deleteBranch(branch: Branch): Promise<void> {
    if (!(await this.notifications.confirm(`¿Eliminar la sucursal ${branch.nombre}?`))) return;
    this.service.deleteBranch(branch.id).subscribe({
      next: () => this.loadBranches(),
      error: (error: ApiError) => this.errorMessage.set(error.message),
    });
  }

  protected searchCities(): void {
    this.cityPage.set(1);
    this.loadCities();
  }

  protected searchBranches(): void {
    this.branchPage.set(1);
    this.loadBranches();
  }

  protected changeCityPage(delta: number): void {
    this.cityPage.update((page) => page + delta);
    this.loadCities();
  }

  protected changeBranchPage(delta: number): void {
    this.branchPage.update((page) => page + delta);
    this.loadBranches();
  }

  protected cityHasNext(): boolean {
    return this.cityPage() * this.pageSize < this.cityTotal();
  }

  protected branchHasNext(): boolean {
    return this.branchPage() * this.pageSize < this.branchTotal();
  }

  private loadCities(): void {
    this.loadingCities.set(true);
    this.service.listCities(this.cityPage(), this.pageSize, this.citySearch.value).subscribe({
      next: (response) => {
        this.cities.set(response.items);
        this.cityTotal.set(response.total);
        this.loadingCities.set(false);
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.loadingCities.set(false);
      },
    });
  }

  private loadCityOptions(): void {
    this.service.listCities(1, 100).subscribe({ next: (response) => this.cityOptions.set(response.items) });
  }

  private loadBranches(): void {
    this.loadingBranches.set(true);
    this.service.listBranches(this.branchPage(), this.pageSize, this.branchSearch.value).subscribe({
      next: (response) => {
        this.branches.set(response.items);
        this.branchTotal.set(response.total);
        this.loadingBranches.set(false);
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.loadingBranches.set(false);
      },
    });
  }

  private handleError(error: ApiError, saving: { set(value: boolean): void }): void {
    this.errorMessage.set(error.message);
    saving.set(false);
  }
}
