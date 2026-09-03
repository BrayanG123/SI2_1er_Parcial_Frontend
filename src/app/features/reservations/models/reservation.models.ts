import { Branch } from '../../branches/models/branch.models';

export type ReservationStatus =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'PREPARADA'
  | 'COMPLETADA'
  | 'CANCELADA'
  | 'VENCIDA';

export interface ReservationCustomer {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
}

export interface ReservationDetail {
  id: string;
  inventario_id: string;
  variante_id: string;
  producto_id: string;
  producto_nombre: string;
  sku: string;
  talla: string;
  color: string;
  cantidad: number;
}

export interface Reservation {
  id: string;
  cliente_id: string;
  sucursal_id: string;
  estado: ReservationStatus;
  fecha_visita: string;
  hora_aproximada: string | null;
  vence_en: string;
  creada_en: string;
  cancelada_en: string | null;
  cliente: ReservationCustomer;
  sucursal: Branch;
  detalles: ReservationDetail[];
}

export interface ReservationWrite {
  sucursal_id: string;
  fecha_visita: string;
  hora_aproximada: string | null;
  detalles: { variante_id: string; cantidad: number }[];
}

export interface BranchReservationFilters {
  branch_id?: string;
  state?: ReservationStatus | '';
  visit_from?: string;
  visit_to?: string;
}

export interface ReservationDraftItem {
  producto_id: string;
  producto_nombre: string;
  variante_id: string;
  sku: string;
  talla: string;
  color: string;
  sucursal_id: string;
  sucursal_nombre: string;
  ciudad_nombre: string;
  cantidad: number;
  stock_disponible: number;
}
