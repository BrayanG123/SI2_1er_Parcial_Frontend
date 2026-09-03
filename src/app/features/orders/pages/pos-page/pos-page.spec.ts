import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { NotificationService } from '../../../../core/services/notification.service';
import { OrdersService } from '../../data-access/orders.service';
import { PosVariant } from '../../models/order.models';
import { PosPage } from './pos-page';

describe('PosPage', () => {
  const variant: PosVariant = {
    inventario_id: 'inventory-1', sucursal_id: 'branch-1', sucursal_nombre: 'Centro',
    variante_id: 'variant-1', producto_id: 'product-1', producto_nombre: 'Polera',
    sku: 'POL-M', talla: 'M', color: 'Negro', precio_unitario: 120, stock_disponible: 2,
  };
  const service = {
    options: vi.fn(), searchPosVariants: vi.fn(), createPos: vi.fn(),
  };
  const notifications = { confirm: vi.fn() };

  beforeEach(() => {
    service.options.mockReset();
    service.searchPosVariants.mockReset();
    service.createPos.mockReset();
    notifications.confirm.mockReset();
    service.options.mockReturnValue(of({
      sucursales: [{ id: 'branch-1', nombre: 'Centro' }],
    }));
    service.searchPosVariants.mockReturnValue(of([variant]));
    service.createPos.mockReturnValue(of({ id: 'order-1', numero: 'PED-000001' }));
    notifications.confirm.mockResolvedValue(true);

    TestBed.configureTestingModule({
      imports: [PosPage],
      providers: [
        { provide: OrdersService, useValue: service },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  it('selects the only branch and searches inventory by SKU', () => {
    const fixture = TestBed.createComponent(PosPage);
    const page = fixture.componentInstance as any;
    page.form.controls.sku.setValue('POL');
    page.search();

    expect(page.form.controls.branch_id.value).toBe('branch-1');
    expect(service.searchPosVariants).toHaveBeenCalledWith('POL', 'branch-1');
    expect(page.results()).toEqual([variant]);
  });

  it('never adds more units than the available stock', () => {
    const fixture = TestBed.createComponent(PosPage);
    const page = fixture.componentInstance as any;
    page.add(variant);
    page.add(variant);
    page.add(variant);

    expect(page.lines()).toHaveLength(1);
    expect(page.lines()[0].cantidad).toBe(2);
    expect(page.total()).toBe(240);
  });

  it('confirms and sends a completed POS sale without requiring a customer', async () => {
    const fixture = TestBed.createComponent(PosPage);
    const page = fixture.componentInstance as any;
    page.add(variant);
    await page.sell();

    expect(notifications.confirm).toHaveBeenCalledOnce();
    expect(service.createPos).toHaveBeenCalledWith({
      sucursal_id: 'branch-1',
      cliente_id: null,
      detalles: [{ variante_id: 'variant-1', cantidad: 1 }],
    });
    expect(page.receipt().numero).toBe('PED-000001');
    expect(page.lines()).toEqual([]);
  });
});
