export interface Supplier {
  id: string;
  nombre: string;
  nit: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  activo: boolean;
}

export type SupplierWrite = Omit<Supplier, 'id'>;
