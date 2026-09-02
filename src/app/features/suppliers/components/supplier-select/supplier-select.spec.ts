import { TestBed } from '@angular/core/testing';

import { SupplierSelect } from './supplier-select';

describe('SupplierSelect', () => {
  it('renders available suppliers', async () => {
    await TestBed.configureTestingModule({ imports: [SupplierSelect] }).compileComponents();
    const fixture = TestBed.createComponent(SupplierSelect);
    fixture.componentRef.setInput('suppliers', [{ id: '1', nombre: 'Textiles', nit: null, telefono: null, email: null, direccion: null, activo: true }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Textiles');
  });
});
