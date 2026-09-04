import { convertToParamMap } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { NotificationService } from '../../../../core/services/notification.service';
import { OrdersService } from '../../../orders/data-access/orders.service';
import { PaymentsService } from '../../data-access/payments.service';
import { StripeBrowserService } from '../../data-access/stripe-browser.service';
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
  const paymentElement = { mount: vi.fn(), unmount: vi.fn() };
  const elements = { create: vi.fn(() => paymentElement) };
  const stripe = {
    elements: vi.fn(() => elements),
    confirmPayment: vi.fn(() => Promise.resolve({ paymentIntent: { status: 'succeeded' } })),
  };
  const stripeBrowser = { load: vi.fn(() => Promise.resolve(stripe)) };

  beforeEach(() => {
    orders.getMine.mockReset().mockReturnValue(of(order));
    payments.getByOrder.mockReset().mockReturnValue(of(null));
    payments.initiate.mockReset().mockReturnValue(of(pending));
    payments.confirm.mockReset().mockReturnValue(of({ ...pending, estado: 'APROBADO', pagado_en: '2026-09-02' }));
    notifications.confirm.mockReset().mockResolvedValue(true);
    paymentElement.mount.mockReset();
    paymentElement.unmount.mockReset();
    elements.create.mockClear();
    stripe.elements.mockClear();
    stripe.confirmPayment.mockClear();
    stripeBrowser.load.mockClear();
    TestBed.configureTestingModule({
      imports: [PaymentPage],
      providers: [
        { provide: OrdersService, useValue: orders },
        { provide: PaymentsService, useValue: payments },
        { provide: StripeBrowserService, useValue: stripeBrowser },
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

  it('mounts Stripe Elements and trusts the webhook-backed status endpoint', async () => {
    const stripePending = {
      ...pending,
      metodo: 'STRIPE',
      ambiente: 'STRIPE',
      referencia_externa: 'pi_test_1',
      client_secret: 'pi_test_1_secret_test',
      publishable_key: 'pk_test_example',
      moneda: 'BOB',
    };
    payments.getByOrder.mockReturnValue(of(stripePending));
    payments.initiate.mockReturnValue(of(stripePending));
    const fixture = TestBed.createComponent(PaymentPage);
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));

    expect(stripeBrowser.load).toHaveBeenCalledWith('pk_test_example');
    expect(paymentElement.mount).toHaveBeenCalledWith('#stripe-payment-element');

    payments.getByOrder.mockReturnValue(of({
      ...stripePending,
      estado: 'APROBADO',
      client_secret: null,
      publishable_key: null,
    }));
    await (fixture.componentInstance as any).confirmStripe();
    await new Promise((resolve) => setTimeout(resolve));

    expect(stripe.confirmPayment).toHaveBeenCalled();
    expect((fixture.componentInstance as any).order().estado).toBe('PAGADO');
  });
});
