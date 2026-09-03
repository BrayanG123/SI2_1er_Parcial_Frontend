import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_URL } from '../../../core/config/api-url.token';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://api.test/api/v1' },
      ],
    });
    service = TestBed.inject(CartService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the active customer cart', () => {
    service.get().subscribe();
    const request = http.expectOne('http://api.test/api/v1/cart');
    expect(request.request.method).toBe('GET');
    request.flush({ detalles: [] });
  });

  it('adds a variant and quantity', () => {
    service.add('variant-1', 2).subscribe();
    const request = http.expectOne('http://api.test/api/v1/cart/items');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ variante_id: 'variant-1', cantidad: 2 });
    request.flush({ detalles: [] });
  });

  it('updates and removes one cart line', () => {
    service.update('item-1', 3).subscribe();
    const update = http.expectOne('http://api.test/api/v1/cart/items/item-1');
    expect(update.request.method).toBe('PATCH');
    expect(update.request.body).toEqual({ cantidad: 3 });
    update.flush({ detalles: [] });

    service.remove('item-1').subscribe();
    const remove = http.expectOne('http://api.test/api/v1/cart/items/item-1');
    expect(remove.request.method).toBe('DELETE');
    remove.flush({ detalles: [] });
  });

  it('clears the active cart', () => {
    service.clear().subscribe();
    const request = http.expectOne('http://api.test/api/v1/cart');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
