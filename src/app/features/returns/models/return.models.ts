import { Branch } from '../../branches/models/branch.models';
import { Refund } from '../../payments/models/payment.models';

export type ReturnStatus = 'SOLICITADA' | 'APROBADA' | 'COMPLETADA' | 'CANCELADA';

export interface ReturnDetail {
  id: string;
  detalle_pedido_id: string;
  variante_id: string;
  producto_nombre: string;
  sku: string;
  talla: string;
  color: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  motivo: string | null;
}

export interface ReturnRequest {
  id: string;
  pedido_id: string;
  cliente_id: string | null;
  estado: ReturnStatus;
  motivo_general: string | null;
  reingresa_stock: boolean | null;
  genera_reembolso: boolean | null;
  monto_estimado: number;
  creada_en: string;
  completada_en: string | null;
  cliente: { id: string; nombres: string; apellidos: string; email: string } | null;
  pedido: { id: string; numero: string; sucursal: Branch };
  detalles: ReturnDetail[];
  reembolso: Refund | null;
}

export interface ReturnCreatePayload {
  pedido_id: string;
  motivo_general: string | null;
  detalles: { detalle_pedido_id: string; cantidad: number; motivo: string | null }[];
}
