export type PaymentStatus = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'REEMBOLSADO';
export type PaymentMethod = 'PASARELA_PRUEBA' | 'STRIPE' | 'CAJA';

export interface Refund {
  id: string;
  pago_id: string;
  devolucion_id: string | null;
  monto: number;
  motivo: string;
  referencia_externa: string | null;
  estado: 'COMPLETADO';
  creado_en: string;
}

export interface Payment {
  id: string;
  pedido_id: string;
  metodo: PaymentMethod;
  estado: PaymentStatus;
  monto: number;
  monto_reembolsado: number;
  referencia_externa: string | null;
  ambiente: 'PRUEBA' | 'STRIPE' | 'LOCAL';
  creado_en: string;
  pagado_en: string | null;
  reembolsos: Refund[];
  client_secret?: string | null;
  publishable_key?: string | null;
  moneda?: string | null;
}
