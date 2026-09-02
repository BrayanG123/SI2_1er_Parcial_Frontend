import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitySelect } from './city-select';

describe('CitySelect', () => {
  let fixture: ComponentFixture<CitySelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CitySelect] }).compileComponents();
    fixture = TestBed.createComponent(CitySelect);
    fixture.componentRef.setInput('cities', [
      { id: 'city-1', nombre: 'Santa Cruz', departamento: 'Santa Cruz' },
    ]);
    fixture.detectChanges();
  });

  it('renders the available cities and emits the selected id', () => {
    const emitted: string[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.textContent).toContain('Santa Cruz');
    select.value = 'city-1';
    select.dispatchEvent(new Event('change'));
    expect(emitted).toEqual(['city-1']);
  });
});
