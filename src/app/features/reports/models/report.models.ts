import { Branch } from '../../branches/models/branch.models';

export interface ReportFilters {
  branch_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface AppliedReportFilters {
  fecha_desde: string | null;
  fecha_hasta: string | null;
  sucursal_id: string | null;
}

export interface ReportOptions {
  sucursales: Branch[];
}

export interface SalesSummary {
  pedidos: number;
  unidades: number;
  venta_bruta: string;
  reembolsos: string;
  venta_neta: string;
  ticket_promedio: string;
}

export interface SalesByChannel {
  canal: 'WEB' | 'MOBILE' | 'POS';
  pedidos: number;
  monto: string;
}

export interface SalesByDay {
  fecha: string;
  pedidos: number;
  monto: string;
}

export interface TopProduct {
  producto_id: string;
  producto_nombre: string;
  unidades: number;
  monto: string;
}

export interface SalesReport {
  resumen: SalesSummary;
  por_canal: SalesByChannel[];
  por_dia: SalesByDay[];
  productos_destacados: TopProduct[];
}

export interface InventorySummary {
  registros: number;
  stock_fisico: number;
  stock_reservado: number;
  stock_disponible: number;
  agotados: number;
  stock_bajo: number;
  umbral_stock_bajo: number;
}

export interface CriticalInventory {
  inventario_id: string;
  sucursal_id: string;
  sucursal_nombre: string;
  producto_id: string;
  producto_nombre: string;
  variante_id: string;
  sku: string;
  stock_fisico: number;
  stock_reservado: number;
  stock_disponible: number;
}

export interface InventoryReport {
  resumen: InventorySummary;
  existencias_criticas: CriticalInventory[];
}

export interface CountByState {
  estado: string;
  cantidad: number;
}

export interface ReservationReport {
  resumen: {
    reservas: number;
    unidades: number;
    convertidas_en_pedido: number;
    tasa_conversion: string;
  };
  por_estado: CountByState[];
}

export interface ReturnReport {
  resumen: {
    devoluciones: number;
    unidades: number;
    monto_solicitado: string;
    monto_reembolsado: string;
  };
  por_estado: CountByState[];
}

export interface DashboardReport {
  generado_en: string;
  filtros: AppliedReportFilters;
  ventas: SalesReport;
  inventario: InventoryReport;
  reservas: ReservationReport;
  devoluciones: ReturnReport;
}

export type ReportSection = 'ventas' | 'inventario' | 'reservas' | 'devoluciones';
