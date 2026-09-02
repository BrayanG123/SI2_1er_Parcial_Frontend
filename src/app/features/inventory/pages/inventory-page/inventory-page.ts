import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ApiError } from '../../../../shared/models/api-error.model';
import { ProductVariant } from '../../../catalog/models/catalog.models';
import { InventoryService } from '../../data-access/inventory.service';
import {
  InventoryItem,
  InventoryMovement,
  InventoryOptions,
  MovementType,
  StockState,
} from '../../models/inventory.models';

@Component({
  selector: 'app-inventory-page',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './inventory-page.html',
})
export class InventoryPage {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InventoryService);
  private readonly notifications = inject(NotificationService);
  protected readonly auth = inject(AuthService);

  protected readonly options = signal<InventoryOptions>({ sucursales: [], productos: [] });
  protected readonly items = signal<InventoryItem[]>([]);
  protected readonly movements = signal<InventoryMovement[]>([]);
  protected readonly selectedInventory = signal<InventoryItem | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly loadingMovements = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly page = signal(1);
  protected readonly pageSize = 20;
  protected readonly total = signal(0);

  protected readonly canManage = computed(() =>
    this.auth.hasAnyRole(['administrador', 'encargado']),
  );
  protected readonly allVariants = computed(() =>
    this.options().productos.flatMap((product) =>
      product.variantes.map((variant) => ({ product, variant })),
    ),
  );
  protected readonly physicalTotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.stock_fisico, 0),
  );
  protected readonly reservedTotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.stock_reservado, 0),
  );
  protected readonly availableTotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.stock_disponible, 0),
  );

  protected readonly filtersForm = this.fb.nonNullable.group({
    city_id: [''],
    branch_id: [''],
    product_id: [''],
    variant_id: [''],
    state: ['' as StockState | ''],
  });
  protected readonly receiptForm = this.fb.nonNullable.group({
    sucursal_id: ['', Validators.required],
    variante_id: ['', Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    observacion: [''],
  });
  protected readonly adjustmentForm = this.fb.nonNullable.group({
    sucursal_id: ['', Validators.required],
    variante_id: ['', Validators.required],
    cantidad: [0, [Validators.required, Validators.pattern(/^-?[1-9]\d*$/)]],
    motivo: ['', [Validators.required, Validators.minLength(3)]],
  });

  constructor() {
    this.loadOptions();
  }

  protected cities(): { id: string; nombre: string }[] {
    const result = new Map<string, string>();
    for (const branch of this.options().sucursales) {
      result.set(branch.ciudad.id, branch.ciudad.nombre);
    }
    return [...result].map(([id, nombre]) => ({ id, nombre }));
  }

  protected filterVariants(): ProductVariant[] {
    const productId = this.filtersForm.controls.product_id.value;
    if (!productId) return this.allVariants().map((item) => item.variant);
    return this.options().productos.find((item) => item.id === productId)?.variantes ?? [];
  }

  protected applyFilters(): void {
    const productId = this.filtersForm.controls.product_id.value;
    const variantId = this.filtersForm.controls.variant_id.value;
    if (
      variantId &&
      productId &&
      !this.filterVariants().some((variant) => variant.id === variantId)
    ) {
      this.filtersForm.controls.variant_id.setValue('');
    }
    this.page.set(1);
    this.loadInventory();
  }

  protected clearFilters(): void {
    this.filtersForm.reset({
      city_id: '',
      branch_id: '',
      product_id: '',
      variant_id: '',
      state: '',
    });
    this.applyFilters();
  }

  protected goToPage(page: number): void {
    if (page < 1 || (page - 1) * this.pageSize >= this.total()) return;
    this.page.set(page);
    this.loadInventory();
  }

  protected receive(): void {
    if (this.receiptForm.invalid) {
      this.receiptForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const value = this.receiptForm.getRawValue();
    this.service
      .receive({ ...value, observacion: value.observacion.trim() || null })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.receiptForm.controls.cantidad.setValue(1);
          this.receiptForm.controls.observacion.setValue('');
          void this.notifications.success('La recepción quedó registrada.');
          this.loadInventory();
        },
        error: (error: ApiError) => {
          this.saving.set(false);
          this.errorMessage.set(error.message);
        },
      });
  }

  protected adjust(): void {
    if (this.adjustmentForm.invalid || this.adjustmentForm.controls.cantidad.value === 0) {
      this.adjustmentForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const value = this.adjustmentForm.getRawValue();
    this.service.adjust({ ...value, motivo: value.motivo.trim() }).subscribe({
      next: () => {
        this.saving.set(false);
        this.adjustmentForm.controls.cantidad.setValue(0);
        this.adjustmentForm.controls.motivo.setValue('');
        void this.notifications.success('El ajuste quedó registrado con su motivo.');
        this.loadInventory();
      },
      error: (error: ApiError) => {
        this.saving.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  protected openHistory(item: InventoryItem): void {
    this.selectedInventory.set(item);
    this.movements.set([]);
    this.loadingMovements.set(true);
    this.service.movements(item.id).subscribe({
      next: (response) => {
        this.movements.set(response.items);
        this.loadingMovements.set(false);
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.loadingMovements.set(false);
      },
    });
  }

  protected closeHistory(): void {
    this.selectedInventory.set(null);
    this.movements.set([]);
  }

  protected stockState(item: InventoryItem): StockState {
    if (item.stock_disponible === 0) return 'AGOTADO';
    if (item.stock_disponible <= 5) return 'BAJO';
    return 'DISPONIBLE';
  }

  protected movementLabel(type: MovementType): string {
    const labels: Record<MovementType, string> = {
      RECEPCION: 'Recepción',
      RESERVA: 'Reserva',
      LIBERACION_RESERVA: 'Liberación de reserva',
      VENTA: 'Venta',
      DEVOLUCION: 'Devolución',
      AJUSTE: 'Ajuste',
    };
    return labels[type];
  }

  private loadOptions(): void {
    this.service.options().subscribe({
      next: (options) => {
        this.options.set(options);
        const defaultBranch = options.sucursales.length === 1 ? options.sucursales[0].id : '';
        const defaultVariant = this.allVariants()[0]?.variant.id ?? '';
        this.receiptForm.patchValue({
          sucursal_id: defaultBranch,
          variante_id: defaultVariant,
        });
        this.adjustmentForm.patchValue({
          sucursal_id: defaultBranch,
          variante_id: defaultVariant,
        });
        this.loadInventory();
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.loading.set(false);
      },
    });
  }

  private loadInventory(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    const values = this.filtersForm.getRawValue();
    this.service.list(this.page(), this.pageSize, values).subscribe({
      next: (response) => {
        this.items.set(response.items);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.loading.set(false);
      },
    });
  }
}
