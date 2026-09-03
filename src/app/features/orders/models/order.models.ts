import { Branch } from '../../branches/models/branch.models';

export type OrderChannel = 'WEB' | 'MOBILE' | 'POS';
export type OrderStatus = 'CREADO' | 'PAGADO' | 'COMPLETADO' | 'CANCELADO' | 'REEMBOLSADO';

export interface OrderCustomer {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
}

export interface OrderDetail {
  id: string;
  variante_id: string;
  producto_id: string;
  producto_nombre: string;
  sku: string;
  talla: string;
  color: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Order {
  id: string;
  numero: string;
  cliente_id: string | null;
  sucursal_id: string;
  reserva_id: string | null;
  canal: OrderChannel;
  estado: OrderStatus;
  subtotal: number;
  descuento: number;
  total: number;
  creado_en: string;
  cliente: OrderCustomer | null;
  sucursal: Branch;
  detalles: OrderDetail[];
}

export interface OrderOptions { sucursales: Branch[]; }

export interface PosVariant {
  inventario_id: string;
  sucursal_id: string;
  sucursal_nombre: string;
  variante_id: string;
  producto_id: string;
  producto_nombre: string;
  sku: string;
  talla: string;
  color: string;
  precio_unitario: number;
  stock_disponible: number;
}

export interface OrderFilters {
  branch_id?: string;
  channel?: OrderChannel | '';
  state?: OrderStatus | '';
  date_from?: string;
  date_to?: string;
}
