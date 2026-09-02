import { TestBed } from '@angular/core/testing';

import { CategorySelect } from './category-select';

describe('CategorySelect', () => {
  it('disables inactive categories', async () => {
    await TestBed.configureTestingModule({ imports: [CategorySelect] }).compileComponents();
    const fixture = TestBed.createComponent(CategorySelect);
    fixture.componentRef.setInput('categories', [{ id: '1', nombre: 'Vestidos', descripcion: null, activa: false }]);
    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll('option') as NodeListOf<HTMLOptionElement>;
    expect(options[1].disabled).toBe(true);
  });
});
