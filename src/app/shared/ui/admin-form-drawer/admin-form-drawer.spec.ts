import { TestBed } from '@angular/core/testing';

import { AdminFormDrawer } from './admin-form-drawer';

describe('AdminFormDrawer', () => {
  it('shows an independent form panel and emits its close action', () => {
    const fixture = TestBed.createComponent(AdminFormDrawer);
    fixture.componentRef.setInput('title', 'Nueva categoría');
    fixture.componentRef.setInput('description', 'Formulario separado');
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nueva categoría');
    expect(fixture.nativeElement.textContent).toContain('Formulario separado');

    const closeButton = fixture.nativeElement.querySelector(
      'button[aria-label="Cerrar"]',
    ) as HTMLButtonElement;
    closeButton.click();

    expect(closed).toHaveBeenCalledOnce();
  });
});
