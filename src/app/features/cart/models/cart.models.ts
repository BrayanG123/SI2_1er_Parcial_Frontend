export interface CartItem {
  id: string;
  variante_id: string;
  producto_id: string;
  producto_nombre: string;
  sku: string;
  talla: string;
  color: string;
  cantidad: number;
  precio_unitario_estimado: number;
  subtotal_estimado: number;
}

export interface Cart {
  id: string;
  cliente_id: string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
  detalles: CartItem[];
  subtotal_estimado: number;
}
