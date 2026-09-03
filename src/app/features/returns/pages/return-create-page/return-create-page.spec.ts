import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';

import { NotificationService } from '../../../../core/services/notification.service';
import { OrdersService } from '../../../orders/data-access/orders.service';
import { ReturnsService } from '../../data-access/returns.service';
import { ReturnCreatePage } from './return-create-page';

describe('ReturnCreatePage', () => {
  const order = {
    id: 'order-1', numero: 'PED-1', estado: 'PAGADO', canal: 'WEB', total: 160,
    detalles: [{
      id: 'detail-1', producto_nombre: 'Polera', talla: 'M', color: 'Negro',
      sku: 'POL-M', cantidad: 2, precio_unitario: 80,
    }],
  };
  const orders = { getMine: vi.fn() };
  const returns = { create: vi.fn() };
  const notifications = { confirm: vi.fn(), success: vi.fn(() => Promise.resolve()) };
  const router = { navigate: vi.fn(() => Promise.resolve(true)) };

  beforeEach(() => {
    orders.getMine.mockReset().mockReturnValue(of(order));
    returns.create.mockReset().mockReturnValue(of({}));
    notifications.confirm.mockReset().mockResolvedValue(true);
    router.navigate.mockReset();
    TestBed.configureTestingModule({
      imports: [ReturnCreatePage],
      providers: [
        { provide: OrdersService, useValue: orders },
        { provide: ReturnsService, useValue: returns },
        { provide: NotificationService, useValue: notifications },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'order-1' }) } } },
      ],
    });
  });

  it('requires at least one selected unit', async () => {
    const page = TestBed.createComponent(ReturnCreatePage).componentInstance as any;
    await page.submit();
    expect(returns.create).not.toHaveBeenCalled();
    expect(page.errorMessage()).toContain('Selecciona');
  });

  it('submits normalized quantities and reasons without calculating a refund', async () => {
    const page = TestBed.createComponent(ReturnCreatePage).componentInstance as any;
    page.form.controls.motivo_general.setValue('  Cambio de talla  ');
    page.setQuantity('detail-1', 2, { target: { value: '1' } });
    page.setMotive('detail-1', { target: { value: '  Muy grande  ' } });
    await page.submit();
    expect(returns.create).toHaveBeenCalledWith({
      pedido_id: 'order-1', motivo_general: 'Cambio de talla',
      detalles: [{ detalle_pedido_id: 'detail-1', cantidad: 1, motivo: 'Muy grande' }],
    });
    expect(router.navigate).toHaveBeenCalledWith(['/devoluciones']);
  });
});
