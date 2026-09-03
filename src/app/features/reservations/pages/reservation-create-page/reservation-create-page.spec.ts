import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { NotificationService } from '../../../../core/services/notification.service';
import { ReservationDraftService } from '../../data-access/reservation-draft.service';
import { ReservationsService } from '../../data-access/reservations.service';
import { ReservationCreatePage } from './reservation-create-page';

describe('ReservationCreatePage', () => {
  const items = signal([
    {
      producto_id: 'product-1', producto_nombre: 'Polera', variante_id: 'variant-1',
      sku: 'POL-M', talla: 'M', color: 'Negro', sucursal_id: 'branch-1',
      sucursal_nombre: 'Centro', ciudad_nombre: 'La Paz', cantidad: 2, stock_disponible: 5,
    },
  ]);
  const service = { create: vi.fn() };
  const draft = {
    items: items.asReadonly(),
    totalUnits: signal(2).asReadonly(),
    branchId: signal<string | null>('branch-1').asReadonly(),
    setQuantity: vi.fn(), remove: vi.fn(), clear: vi.fn(),
  };
  const notifications = { success: vi.fn(() => Promise.resolve()) };
  const router = { navigate: vi.fn(() => Promise.resolve(true)) };

  beforeEach(() => {
    service.create.mockReset();
    draft.clear.mockReset();
    router.navigate.mockReset();
    service.create.mockReturnValue(of({}));
    TestBed.configureTestingModule({
      imports: [ReservationCreatePage],
      providers: [
        { provide: ReservationsService, useValue: service },
        { provide: ReservationDraftService, useValue: draft },
        { provide: NotificationService, useValue: notifications },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {} },
      ],
    });
  });

  it('submits all selected garments with the visit data', () => {
    const fixture = TestBed.createComponent(ReservationCreatePage);
    const page = fixture.componentInstance as any;
    page.form.setValue({ fecha_visita: '2026-09-10', hora_aproximada: '16:30' });
    page.submit();

    expect(service.create).toHaveBeenCalledWith({
      sucursal_id: 'branch-1',
      fecha_visita: '2026-09-10',
      hora_aproximada: '16:30',
      detalles: [{ variante_id: 'variant-1', cantidad: 2 }],
    });
    expect(draft.clear).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/reservas']);
  });
});
