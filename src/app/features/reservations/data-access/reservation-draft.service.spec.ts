import { TestBed } from '@angular/core/testing';

import { ReservationDraftService } from './reservation-draft.service';

describe('ReservationDraftService', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
  });

  function garment(branchId = 'branch-1', variantId = 'variant-1') {
    return {
      producto_id: 'product-1',
      producto_nombre: 'Polera',
      variante_id: variantId,
      sku: 'POL-M',
      talla: 'M',
      color: 'Negro',
      sucursal_id: branchId,
      sucursal_nombre: 'Centro',
      ciudad_nombre: 'La Paz',
      stock_disponible: 2,
    };
  }

  it('groups several variants while preserving a single branch', () => {
    const service = TestBed.inject(ReservationDraftService);
    expect(service.add(garment())).toBe('added');
    expect(service.add(garment('branch-1', 'variant-2'))).toBe('added');
    expect(service.items()).toHaveLength(2);
    expect(service.totalUnits()).toBe(2);
    expect(service.branchId()).toBe('branch-1');
  });

  it('rejects garments from a different branch', () => {
    const service = TestBed.inject(ReservationDraftService);
    service.add(garment());
    expect(service.add(garment('branch-2', 'variant-2'))).toBe('different_branch');
    expect(service.items()).toHaveLength(1);
  });

  it('never exceeds the availability snapshot and persists the draft', () => {
    const service = TestBed.inject(ReservationDraftService);
    service.add(garment());
    service.add(garment());
    expect(service.add(garment())).toBe('stock_limit');
    expect(service.totalUnits()).toBe(2);
    expect(JSON.parse(sessionStorage.getItem('ropa_reservation_draft') ?? '[]')).toHaveLength(1);
  });
});
