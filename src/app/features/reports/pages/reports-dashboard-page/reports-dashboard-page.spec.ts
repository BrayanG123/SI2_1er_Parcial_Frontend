import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ReportsService } from '../../data-access/reports.service';
import { DashboardReport } from '../../models/report.models';
import { ReportsDashboardPage } from './reports-dashboard-page';

describe('ReportsDashboardPage', () => {
  const branch = {
    id: 'branch-1', ciudad_id: 'city-1', nombre: 'Centro', direccion: 'Av. Uno',
    telefono: null, horario_informativo: '08:00-18:00', activa: true,
    ciudad: { id: 'city-1', nombre: 'La Paz', departamento: 'La Paz' },
  };
  const report: DashboardReport = {
    generado_en: '2026-09-04T12:00:00Z',
    filtros: { fecha_desde: null, fecha_hasta: null, sucursal_id: 'branch-1' },
    ventas: {
      resumen: { pedidos: 2, unidades: 3, venta_bruta: '255.00', reembolsos: '80.00', venta_neta: '175.00', ticket_promedio: '127.50' },
      por_canal: [
        { canal: 'WEB', pedidos: 1, monto: '160.00' },
        { canal: 'MOBILE', pedidos: 0, monto: '0.00' },
        { canal: 'POS', pedidos: 1, monto: '95.00' },
      ],
      por_dia: [{ fecha: '2026-09-04', pedidos: 2, monto: '255.00' }],
      productos_destacados: [{ producto_id: 'product-1', producto_nombre: 'Polera', unidades: 3, monto: '255.00' }],
    },
    inventario: {
      resumen: { registros: 2, stock_fisico: 18, stock_reservado: 0, stock_disponible: 18, agotados: 0, stock_bajo: 0, umbral_stock_bajo: 5 },
      existencias_criticas: [],
    },
    reservas: {
      resumen: { reservas: 1, unidades: 2, convertidas_en_pedido: 0, tasa_conversion: '0.00' },
      por_estado: [{ estado: 'CANCELADA', cantidad: 1 }],
    },
    devoluciones: {
      resumen: { devoluciones: 1, unidades: 1, monto_solicitado: '80.00', monto_reembolsado: '80.00' },
      por_estado: [{ estado: 'COMPLETADA', cantidad: 1 }],
    },
  };
  const reportsService = {
    options: vi.fn(),
    dashboard: vi.fn(),
  };

  beforeEach(() => {
    reportsService.options.mockReset().mockReturnValue(of({ sucursales: [branch] }));
    reportsService.dashboard.mockReset().mockReturnValue(of(report));
    TestBed.configureTestingModule({
      imports: [ReportsDashboardPage],
      providers: [{ provide: ReportsService, useValue: reportsService }],
    });
  });

  it('loads reproducible indicators and selects the only allowed branch', () => {
    const fixture = TestBed.createComponent(ReportsDashboardPage);
    fixture.detectChanges();
    const page = fixture.componentInstance as any;
    expect(reportsService.options).toHaveBeenCalled();
    expect(reportsService.dashboard).toHaveBeenCalledWith();
    expect(page.filters.controls.branch_id.value).toBe('branch-1');
    expect(page.report().ventas.resumen.venta_neta).toBe('175.00');
    expect(fixture.nativeElement.textContent).toContain('La explicación con inteligencia artificial está diferida');
  });

  it('applies filters and changes between report views', () => {
    const fixture = TestBed.createComponent(ReportsDashboardPage);
    const page = fixture.componentInstance as any;
    page.filters.setValue({
      branch_id: 'branch-1',
      date_from: '2026-09-01',
      date_to: '2026-09-04',
    });
    page.load();
    expect(reportsService.dashboard).toHaveBeenLastCalledWith({
      branch_id: 'branch-1',
      date_from: '2026-09-01',
      date_to: '2026-09-04',
    });
    page.show('inventario');
    expect(page.section()).toBe('inventario');
    expect(page.dailyWidth('127.50')).toBe(50);
  });
});
