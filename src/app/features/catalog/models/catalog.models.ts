import { Category } from '../../categories/models/category.models';
import { Supplier } from '../../suppliers/models/supplier.models';

export interface Size { id: string; nombre: string; orden: number | null; }
export interface Color { id: string; nombre: string; codigo_hex: string | null; }
export interface Season { id: string; nombre: string; fecha_inicio: string | null; fecha_fin: string | null; activa: boolean; }
export interface Collection { id: string; temporada_id: string; nombre: string; descripcion: string | null; temporada: Season; }
export interface ProductImage { id: string; url: string; es_principal: boolean; orden: number; }
export interface ProductVariant {
  id: string; producto_id: string; talla_id: string; color_id: string; sku: string;
  precio: number | null; activa: boolean; talla: Size; color: Color;
}
export interface Product {
  id: string; categoria_id: string; proveedor_id: string; temporada_id: string | null;
  coleccion_id: string | null; nombre: string; descripcion: string | null; marca: string | null;
  precio_base: number; activo: boolean; categoria: Category; proveedor: Supplier;
  temporada: Season | null; coleccion: Collection | null; variantes: ProductVariant[];
  imagenes: ProductImage[];
}
export interface ProductFilters {
  q?: string; category_id?: string; season_id?: string; size_id?: string; color_id?: string;
}
export interface ProductAvailability {
  sucursal_id: string;
  sucursal_nombre: string;
  ciudad_nombre: string;
  variante_id: string;
  talla: string;
  color: string;
  sku: string;
  stock_disponible: number;
}
export interface VariantWrite {
  talla_id: string; color_id: string; sku: string; precio: number | null; activa: boolean;
}
export interface ProductWrite {
  categoria_id: string; proveedor_id: string; temporada_id: string | null;
  coleccion_id: string | null; nombre: string; descripcion: string | null; marca: string | null;
  precio_base: number; activo: boolean; variantes: VariantWrite[];
  imagenes: { url: string; es_principal: boolean; orden: number }[];
}
