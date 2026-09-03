import { convertToParamMap } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { NotificationService } from '../../../../core/services/notification.service';
import { OrdersService } from '../../../orders/data-access/orders.service';
import { PaymentsService } from '../../data-access/payments.service';
import { PaymentPage } from './payment-page';

describe('PaymentPage', () => {
  const order = {
    id: 'order-1', numero: 'PED-1', estado: 'CREADO', canal: 'WEB', total: 160,
    creado_en: '2026-09-02T12:00:00Z', sucursal: { id: 'branch-1', nombre: 'Centro' },
    detalles: [],
  };
  const pending = {
    id: 'payment-1', pedido_id: 'order-1', metodo: 'PASARELA_PRUEBA',
    estado: 'PENDIENTE', monto: 160, monto_reembolsado: 0,
    referencia_externa: 'TEST-PAY-1', ambiente: 'PRUEBA', creado_en: '2026-09-02',
    pagado_en: null, reembolsos: [],
  };
  const orders = { getMine: vi.fn() };
  const payments = { getByOrder: vi.fn(), initiate: vi.fn(), confirm: vi.fn() };
  const notifications = { confirm: vi.fn(), success: vi.fn(() => Promise.resolve()) };

  beforeEach(() => {
    orders.getMine.mockReset().mockReturnValue(of(order));
    payments.getByOrder.mockReset().mockReturnValue(of(null));
    payments.initiate.mockReset().mockReturnValue(of(pending));
    payments.confirm.mockReset().mockReturnValue(of({ ...pending, estado: 'APROBADO', pagado_en: '2026-09-02' }));
    notifications.confirm.mockReset().mockResolvedValue(true);
    TestBed.configureTestingModule({
      imports: [PaymentPage],
      providers: [
        { provide: OrdersService, useValue: orders },
        { provide: PaymentsService, useValue: payments },
        { provide: NotificationService, useValue: notifications },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'order-1' }) } } },
      ],
    });
  });

  it('initiates the test payment using only the order id', () => {
    const page = TestBed.createComponent(PaymentPage).componentInstance as any;
    page.initiate();
    expect(payments.initiate).toHaveBeenCalledWith('order-1');
    expect(page.payment()).toEqual(pending);
  });

  it('confirms the simulated result and updates the visible order state', async () => {
    payments.getByOrder.mockReturnValue(of(pending));
    const page = TestBed.createComponent(PaymentPage).componentInstance as any;
    await page.confirm('APROBAR');
    expect(payments.confirm).toHaveBeenCalledWith('payment-1', 'APROBAR');
    expect(page.order().estado).toBe('PAGADO');
  });
});
