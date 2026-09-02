import { Branch } from '../../branches/models/branch.models';
import { Product, ProductVariant } from '../../catalog/models/catalog.models';

export type StockState = 'DISPONIBLE' | 'BAJO' | 'AGOTADO';
export type MovementType =
  | 'RECEPCION'
  | 'RESERVA'
  | 'LIBERACION_RESERVA'
  | 'VENTA'
  | 'DEVOLUCION'
  | 'AJUSTE';

export interface InventoryProduct {
  id: string;
  nombre: string;
  marca: string | null;
  activo: boolean;
}

export interface InventoryItem {
  id: string;
  sucursal_id: string;
  variante_id: string;
  stock_fisico: number;
  stock_reservado: number;
  stock_disponible: number;
  actualizado_en: string;
  sucursal: Branch;
  variante: ProductVariant;
  producto: InventoryProduct;
}

export interface InventoryMovement {
  id: string;
  inventario_id: string;
  tipo: MovementType;
  cantidad: number;
  referencia_tipo: string | null;
  referencia_id: string | null;
  observacion: string | null;
  creado_en: string;
}

export interface InventoryOptions {
  sucursales: Branch[];
  productos: Product[];
}

export interface InventoryFilters {
  branch_id?: string;
  city_id?: string;
  product_id?: string;
  variant_id?: string;
  state?: StockState | '';
}

export interface ReceiptWrite {
  sucursal_id: string;
  variante_id: string;
  cantidad: number;
  observacion: string | null;
}

export interface AdjustmentWrite {
  sucursal_id: string;
  variante_id: string;
  cantidad: number;
  motivo: string;
}
