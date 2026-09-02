import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AuthService } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { InventoryService } from '../../data-access/inventory.service';
import { InventoryPage } from './inventory-page';

describe('InventoryPage', () => {
  const inventoryService = {
    options: vi.fn(),
    list: vi.fn(),
    receive: vi.fn(),
    adjust: vi.fn(),
    movements: vi.fn(),
  };
  const authService = { hasAnyRole: vi.fn(() => true) };
  const notifications = { success: vi.fn(() => Promise.resolve()) };

  beforeEach(() => {
    inventoryService.options.mockReset();
    inventoryService.list.mockReset();
    inventoryService.receive.mockReset();
    inventoryService.adjust.mockReset();
    inventoryService.movements.mockReset();
    inventoryService.options.mockReturnValue(
      of({
        sucursales: [
          {
            id: 'branch-1',
            ciudad_id: 'city-1',
            nombre: 'Centro',
            direccion: 'Av. Uno',
            telefono: null,
            horario_informativo: '08:00-18:00',
            activa: true,
            ciudad: { id: 'city-1', nombre: 'La Paz', departamento: 'La Paz' },
          },
        ],
        productos: [
          {
            id: 'product-1',
            nombre: 'Polera',
            variantes: [
              {
                id: 'variant-1',
                sku: 'POL-M',
                talla: { id: 'size-1', nombre: 'M', orden: 1 },
                color: { id: 'color-1', nombre: 'Negro', codigo_hex: '#000000' },
              },
            ],
          },
        ],
      }),
    );
    inventoryService.list.mockReturnValue(
      of({ items: [], page: 1, page_size: 20, total: 0 }),
    );
    inventoryService.receive.mockReturnValue(of({}));

    TestBed.configureTestingModule({
      imports: [InventoryPage],
      providers: [
        { provide: InventoryService, useValue: inventoryService },
        { provide: AuthService, useValue: authService },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  it('applies city, branch, product, variant and state filters', () => {
    const fixture = TestBed.createComponent(InventoryPage);
    const page = fixture.componentInstance as any;
    page.filtersForm.setValue({
      city_id: 'city-1',
      branch_id: 'branch-1',
      product_id: 'product-1',
      variant_id: 'variant-1',
      state: 'BAJO',
    });
    page.applyFilters();

    expect(inventoryService.list).toHaveBeenLastCalledWith(1, 20, {
      city_id: 'city-1',
      branch_id: 'branch-1',
      product_id: 'product-1',
      variant_id: 'variant-1',
      state: 'BAJO',
    });
  });

  it('submits a validated receipt and normalizes an empty observation', () => {
    const fixture = TestBed.createComponent(InventoryPage);
    const page = fixture.componentInstance as any;
    page.receiptForm.setValue({
      sucursal_id: 'branch-1',
      variante_id: 'variant-1',
      cantidad: 8,
      observacion: '   ',
    });
    page.receive();

    expect(inventoryService.receive).toHaveBeenCalledWith({
      sucursal_id: 'branch-1',
      variante_id: 'variant-1',
      cantidad: 8,
      observacion: null,
    });
  });
});
