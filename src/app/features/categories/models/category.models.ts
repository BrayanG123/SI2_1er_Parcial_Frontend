export interface Category {
  id: string;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
}

export interface CategoryWrite {
  nombre: string;
  descripcion: string | null;
  activa: boolean;
}
